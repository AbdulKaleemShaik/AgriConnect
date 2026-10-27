package com.agriconnect.order;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agriconnect.cart.CartItem;
import com.agriconnect.cart.CartItemRepository;
import com.agriconnect.catalog.Product;
import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.common.exception.ConflictException;
import com.agriconnect.common.exception.ResourceNotFoundException;
import com.agriconnect.notification.EmailRequestedEvent;
import com.agriconnect.order.dto.OrderResponse;
import com.agriconnect.order.dto.PlaceOrderRequest;
import com.agriconnect.security.AppUserDetails;
import com.agriconnect.user.Role;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ApplicationEventPublisher events;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                        ApplicationEventPublisher events) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.events = events;
    }

    /**
     * Checks out the customer's cart atomically: validates availability, decrements stock,
     * creates one order per cart line and empties the cart. Any failure rolls back everything.
     * Concurrent checkouts of the same product are guarded by the product's @Version column.
     */
    @Transactional
    public List<OrderResponse> placeOrder(Long customerId, PlaceOrderRequest request) {
        List<CartItem> cart = cartItemRepository.findByCustomerIdOrderByIdAsc(customerId);
        if (cart.isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        List<CustomerOrder> orders = new ArrayList<>();
        for (CartItem item : cart) {
            Product product = item.getProduct();
            if (!product.isPurchasable()) {
                throw new ConflictException("'" + product.getTitle() + "' is no longer available");
            }
            if (item.getQuantity() > product.getStock()) {
                throw new ConflictException("Only " + product.getStock() + " unit(s) of '" + product.getTitle()
                        + "' are in stock");
            }
            product.setStock(product.getStock() - item.getQuantity());

            CustomerOrder order = new CustomerOrder();
            order.setOrderNumber(newOrderNumber());
            order.setCustomer(item.getCustomer());
            order.setProduct(product);
            order.setQuantity(item.getQuantity());
            order.setUnitPrice(product.getDiscountPrice());
            order.setTotalPrice(product.getDiscountPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            order.setStatus(OrderStatus.PLACED);
            order.setPaymentType(request.paymentType().trim());
            order.setShippingAddress(toAddress(request));
            orders.add(order);
        }

        List<CustomerOrder> saved = orderRepository.saveAll(orders);
        cartItemRepository.deleteByCustomerId(customerId);
        saved.forEach(order -> notifyCustomer(order, "Thank you! Your order has been placed."));
        return saved.stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByOrderDateDesc(customerId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getFarmerOrders(Long farmerId, Pageable pageable) {
        return orderRepository.findByProductFarmerId(farmerId, pageable).map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, AppUserDetails actor) {
        CustomerOrder order = findOrder(orderId);
        checkCanView(order, actor);
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getByOrderNumber(String orderNumber, AppUserDetails actor) {
        CustomerOrder order = orderRepository.findByOrderNumber(orderNumber.trim())
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderNumber));
        checkCanView(order, actor);
        return OrderResponse.from(order);
    }

    /** Only the customer who placed the order can cancel it, and only before it ships. Stock is restored. */
    @Transactional
    public OrderResponse cancel(Long orderId, Long customerId) {
        CustomerOrder order = findOrder(orderId);
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new AccessDeniedException("You can only cancel your own orders");
        }
        if (!order.getStatus().isCancellable()) {
            throw new ConflictException("Order can no longer be cancelled (status: " + order.getStatus().label() + ")");
        }
        order.setStatus(OrderStatus.CANCELLED);
        Product product = order.getProduct();
        product.setStock(product.getStock() + order.getQuantity());
        notifyCustomer(order, "Your order has been cancelled.");
        return OrderResponse.from(order);
    }

    /** Fulfilment status changes by the farmer who sells the product, or by an admin. */
    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus, AppUserDetails actor) {
        CustomerOrder order = findOrder(orderId);
        if (!actor.hasRole(Role.ADMIN) && !order.getProduct().isOwnedBy(actor.getId())) {
            throw new AccessDeniedException("You can only update orders for your own products");
        }
        if (order.getStatus().isFinal()) {
            throw new ConflictException("Order is already " + order.getStatus().label().toLowerCase(Locale.ROOT));
        }
        if (newStatus == OrderStatus.CANCELLED) {
            Product product = order.getProduct();
            product.setStock(product.getStock() + order.getQuantity());
        }
        order.setStatus(newStatus);
        notifyCustomer(order, "Your order status is now: " + newStatus.label() + ".");
        return OrderResponse.from(order);
    }

    private void checkCanView(CustomerOrder order, AppUserDetails actor) {
        boolean allowed = actor.hasRole(Role.ADMIN)
                || order.getCustomer().getId().equals(actor.getId())
                || order.getProduct().isOwnedBy(actor.getId());
        if (!allowed) {
            // 404 rather than 403 so order ids of other users cannot be probed.
            throw ResourceNotFoundException.of("Order", order.getId());
        }
    }

    private static ShippingAddress toAddress(PlaceOrderRequest request) {
        return new ShippingAddress(request.firstName().trim(), request.lastName(), request.email().trim(),
                request.mobileNo(), request.address().trim(), request.city().trim(), request.state().trim(),
                request.pincode());
    }

    private CustomerOrder findOrder(Long orderId) {
        return orderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", orderId));
    }

    private static String newOrderNumber() {
        return "AC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }

    private void notifyCustomer(CustomerOrder order, String headline) {
        ShippingAddress to = order.getShippingAddress();
        String body = """
                Hello %s,

                %s

                Order:     %s
                Product:   %s
                Quantity:  %d
                Total:     %s
                Payment:   %s
                Status:    %s

                - AgriConnect
                """.formatted(to.getFirstName(), headline, order.getOrderNumber(), order.getProduct().getTitle(),
                order.getQuantity(), order.getTotalPrice(), order.getPaymentType(), order.getStatus().label());
        events.publishEvent(new EmailRequestedEvent(to.getEmail(), "AgriConnect order " + order.getOrderNumber(),
                body));
    }
}
