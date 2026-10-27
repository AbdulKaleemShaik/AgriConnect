package com.agriconnect.catalog.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Product fields sent as multipart form data (with an optional 'image' part). */
public record ProductRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String description,
        @NotBlank @Size(max = 100) String category,
        @NotNull @DecimalMin(value = "0.01") @Digits(integer = 10, fraction = 2) BigDecimal price,
        @NotNull @Min(0) @Max(1_000_000) Integer stock,
        @Min(0) @Max(100) Integer discount,
        Boolean active) {

    public int discountOrZero() {
        return discount == null ? 0 : discount;
    }

    public boolean activeOrDefault() {
        return active == null || active;
    }
}
