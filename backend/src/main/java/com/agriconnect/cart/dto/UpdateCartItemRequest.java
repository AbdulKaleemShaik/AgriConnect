package com.agriconnect.cart.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Sets the absolute quantity of a product in the cart; 0 removes it. */
public record UpdateCartItemRequest(@NotNull @Min(0) @Max(1000) Integer quantity) {
}
