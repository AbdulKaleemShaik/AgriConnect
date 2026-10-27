package com.agriconnect.order;

import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.agriconnect.common.PageResponse;
import com.agriconnect.order.dto.OrderResponse;
import com.agriconnect.order.dto.PlaceOrderRequest;
import com.agriconnect.order.dto.UpdateOrderStatusRequest;
import com.agriconnect.security.AppUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Check out the cart (customer). Returns one order per cart line")
    public List<OrderResponse> place(@AuthenticationPrincipal AppUserDetails me,
                                     @Valid @RequestBody PlaceOrderRequest request) {
        return orderService.placeOrder(me.getId(), request);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "List the customer's own orders, newest first")
    public List<OrderResponse> mine(@AuthenticationPrincipal AppUserDetails me) {
        return orderService.getCustomerOrders(me.getId());
    }

    @GetMapping("/farmer")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "List orders for the authenticated farmer's products (paginated)")
    public PageResponse<OrderResponse> forFarmer(
            @AuthenticationPrincipal AppUserDetails me,
            @ParameterObject @PageableDefault(size = 20, sort = "orderDate", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return PageResponse.from(orderService.getFarmerOrders(me.getId(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an order (its customer, the selling farmer, or an admin)")
    public OrderResponse get(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails me) {
        return orderService.getOrder(id, me);
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Look up an order by its public order number")
    public OrderResponse getByNumber(@PathVariable String orderNumber, @AuthenticationPrincipal AppUserDetails me) {
        return orderService.getByOrderNumber(orderNumber, me);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Cancel an order that has not shipped yet (customer who placed it)")
    public OrderResponse cancel(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails me) {
        return orderService.cancel(id, me.getId());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    @Operation(summary = "Update fulfilment status (selling farmer or admin)")
    public OrderResponse updateStatus(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails me,
                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request.status(), me);
    }
}
