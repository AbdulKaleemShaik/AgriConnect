package com.agriconnect.cart.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddToCartRequest(
        @NotNull Long productId,
        @Min(1) @Max(1000) Integer quantity) {

    public int quantityOrOne() {
        return quantity == null ? 1 : quantity;
    }
}
