package com.agriconnect.admin;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agriconnect.admin.dto.UpdateUserStatusRequest;
import com.agriconnect.common.PageResponse;
import com.agriconnect.order.OrderService;
import com.agriconnect.order.dto.OrderResponse;
import com.agriconnect.security.AppUserDetails;
import com.agriconnect.user.Role;
import com.agriconnect.user.UserService;
import com.agriconnect.user.dto.UserResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Platform administration (ADMIN role only)")
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;

    public AdminController(UserService userService, OrderService orderService) {
        this.userService = userService;
        this.orderService = orderService;
    }

    @GetMapping("/users")
    @Operation(summary = "List users, optionally filtered by role")
    public PageResponse<UserResponse> users(@RequestParam(required = false) Role role,
                                            @ParameterObject @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return PageResponse.from(userService.listUsers(role, pageable));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Enable or disable a user account (disabled users can no longer log in or use tokens)")
    public UserResponse setStatus(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails me,
                                  @Valid @RequestBody UpdateUserStatusRequest request) {
        return userService.setEnabled(id, request.enabled(), me.getId());
    }

    @GetMapping("/orders")
    @Operation(summary = "List all orders (paginated)")
    public PageResponse<OrderResponse> orders(
            @ParameterObject @PageableDefault(size = 20, sort = "orderDate", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return PageResponse.from(orderService.getAllOrders(pageable));
    }
}
