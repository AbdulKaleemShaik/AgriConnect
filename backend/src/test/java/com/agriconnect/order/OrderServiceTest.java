package com.agriconnect.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;

import com.agriconnect.TestData;
import com.agriconnect.cart.CartItem;
import com.agriconnect.cart.CartItemRepository;
import com.agriconnect.catalog.Product;
import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.common.exception.ConflictException;
import com.agriconnect.common.exception.ResourceNotFoundException;
import com.agriconnect.notification.EmailRequestedEvent;
import com.agriconnect.order.dto.OrderResponse;
import com.agriconnect.order.dto.PlaceOrderRequest;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock ApplicationEventPublisher events;
    @InjectMocks OrderService orderService;

    private final User farmer = TestData.user(1, Role.FARMER);
    private final User customer = TestData.user(3, Role.CUSTOMER);

    private static final PlaceOrderRequest CHECKOUT = new PlaceOrderRequest("Asha", "Rao", "asha@example.com",
            "9876543210", "12 Market St", "Guntur", "Andhra Pradesh", "522001", "COD");

    @Test
    void placeOrderDecrementsStockClearsCartAndNotifies() {
        Product tomatoes = TestData.product(10, farmer, "25.00", 5);
        Product onions = TestData.product(11, farmer, "10.00", 8);
        when(cartItemRepository.findByCustomerIdOrderByIdAsc(3L)).thenReturn(List.of(
                new CartItem(customer, tomatoes, 2), new CartItem(customer, onions, 8)));
        when(orderRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        List<OrderResponse> orders = orderService.placeOrder(3L, CHECKOUT);

        assertThat(orders).hasSize(2);
        assertThat(orders.get(0).totalPrice()).isEqualByComparingTo("50.00");
        assertThat(orders.get(0).status()).isEqualTo(OrderStatus.PLACED);
        assertThat(orders.get(0).orderNumber()).startsWith("AC-");
        assertThat(tomatoes.getStock()).isEqualTo(3);
        assertThat(onions.getStock()).isZero();
        verify(cartItemRepository).deleteByCustomerId(3L);
        verify(events, times(2)).publishEvent(any(EmailRequestedEvent.class));
    }

    @Test
    void placeOrderWithEmptyCartFails() {
        when(cartItemRepository.findByCustomerIdOrderByIdAsc(3L)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.placeOrder(3L, CHECKOUT)).isInstanceOf(BadRequestException.class);
        verify(orderRepository, never()).saveAll(anyList());
    }

    @Test
    void placeOrderFailsWhenStockIsInsufficient() {
        Product tomatoes = TestData.product(10, farmer, "25.00", 1);
        when(cartItemRepository.findByCustomerIdOrderByIdAsc(3L))
                .thenReturn(List.of(new CartItem(customer, tomatoes, 2)));

        assertThatThrownBy(() -> orderService.placeOrder(3L, CHECKOUT))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("in stock");
        verify(cartItemRepository, never()).deleteByCustomerId(any());
    }

    @Test
    void placeOrderFailsForProductThatWasRemoved() {
        Product tomatoes = TestData.product(10, farmer, "25.00", 10);
        tomatoes.setDeleted(true);
        when(cartItemRepository.findByCustomerIdOrderByIdAsc(3L))
                .thenReturn(List.of(new CartItem(customer, tomatoes, 1)));

        assertThatThrownBy(() -> orderService.placeOrder(3L, CHECKOUT))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("no longer available");
    }

    @Test
    void customerCanCancelOwnOrderAndStockIsRestored() {
        CustomerOrder order = order(OrderStatus.PLACED, 4);
        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.cancel(100L, customer.getId());

        assertThat(response.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(order.getProduct().getStock()).isEqualTo(6 + 4);
    }

    @Test
    void customerCannotCancelSomeoneElsesOrder() {
        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order(OrderStatus.PLACED, 1)));

        assertThatThrownBy(() -> orderService.cancel(100L, 999L)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void shippedOrderCannotBeCancelled() {
        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order(OrderStatus.SHIPPED, 1)));

        assertThatThrownBy(() -> orderService.cancel(100L, customer.getId())).isInstanceOf(ConflictException.class);
    }

    @Test
    void sellingFarmerCanUpdateStatus() {
        CustomerOrder order = order(OrderStatus.PLACED, 1);
        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.updateStatus(100L, OrderStatus.SHIPPED, TestData.principal(farmer));

        assertThat(response.status()).isEqualTo(OrderStatus.SHIPPED);
        assertThat(response.statusLabel()).isEqualTo("Shipped/Dispatched");
    }

    @Test
    void otherFarmerCannotUpdateStatus() {
        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order(OrderStatus.PLACED, 1)));

        assertThatThrownBy(() -> orderService.updateStatus(100L, OrderStatus.SHIPPED,
                TestData.principal(TestData.user(2, Role.FARMER))))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void deliveredOrderStatusIsFinal() {
        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order(OrderStatus.DELIVERED, 1)));

        assertThatThrownBy(() -> orderService.updateStatus(100L, OrderStatus.SHIPPED,
                TestData.principal(TestData.user(99, Role.ADMIN))))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void unrelatedUserGetsNotFoundForForeignOrder() {
        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order(OrderStatus.PLACED, 1)));

        assertThatThrownBy(() -> orderService.getOrder(100L, TestData.principal(TestData.user(50, Role.CUSTOMER))))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private CustomerOrder order(OrderStatus status, int quantity) {
        Product product = TestData.product(10, farmer, "25.00", 6);
        CustomerOrder order = new CustomerOrder();
        order.setId(100L);
        order.setOrderNumber("AC-TEST");
        order.setCustomer(customer);
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setUnitPrice(product.getDiscountPrice());
        order.setTotalPrice(product.getDiscountPrice().multiply(java.math.BigDecimal.valueOf(quantity)));
        order.setStatus(status);
        order.setPaymentType("COD");
        order.setShippingAddress(new ShippingAddress("Asha", "Rao", "asha@example.com", "9876543210",
                "12 Market St", "Guntur", "AP", "522001"));
        return order;
    }
}
