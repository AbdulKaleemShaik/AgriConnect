package com.agriconnect.cart;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriconnect.cart.dto.AddToCartRequest;
import com.agriconnect.cart.dto.CartResponse;
import com.agriconnect.cart.dto.UpdateCartItemRequest;
import com.agriconnect.security.AppUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Cart", description = "The authenticated customer's cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get the cart with line totals and grand total")
    public CartResponse get(@AuthenticationPrincipal AppUserDetails me) {
        return cartService.getCart(me.getId());
    }

    @PostMapping("/items")
    @Operation(summary = "Add a product to the cart (quantity defaults to 1)")
    public CartResponse add(@AuthenticationPrincipal AppUserDetails me,
                            @Valid @RequestBody AddToCartRequest request) {
        return cartService.addItem(me.getId(), request.productId(), request.quantityOrOne());
    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Set the quantity of a product in the cart (0 removes it)")
    public CartResponse update(@AuthenticationPrincipal AppUserDetails me, @PathVariable Long productId,
                               @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateQuantity(me.getId(), productId, request.quantity());
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove a product from the cart")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal AppUserDetails me, @PathVariable Long productId) {
        cartService.removeItem(me.getId(), productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Empty the cart")
    public ResponseEntity<Void> clear(@AuthenticationPrincipal AppUserDetails me) {
        cartService.clear(me.getId());
        return ResponseEntity.noContent().build();
    }
}
