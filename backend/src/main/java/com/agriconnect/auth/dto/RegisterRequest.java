package com.agriconnect.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Sign-up data for customers and farmers (sent as multipart form fields with an optional 'image'). */
public record RegisterRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 72, message = "must be between 8 and 72 characters") String password,
        @Pattern(regexp = "^$|^\\d{10}$", message = "must be 10 digits") String mobileNumber,
        @Size(max = 255) String address,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Pattern(regexp = "^$|^\\d{6}$", message = "must be 6 digits") String pincode) {
}
