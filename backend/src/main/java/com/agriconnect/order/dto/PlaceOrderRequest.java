package com.agriconnect.order.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Checkout request: the cart contents are taken from the server-side cart, not from the client. */
public record PlaceOrderRequest(
        @NotBlank @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Pattern(regexp = "^\\d{10}$", message = "must be 10 digits") String mobileNo,
        @NotBlank @Size(max = 255) String address,
        @NotBlank @Size(max = 100) String city,
        @NotBlank @Size(max = 100) String state,
        @NotBlank @Pattern(regexp = "^\\d{6}$", message = "must be 6 digits") String pincode,
        @NotBlank @Size(max = 30) String paymentType) {
}
