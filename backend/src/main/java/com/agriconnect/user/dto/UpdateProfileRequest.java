package com.agriconnect.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Profile fields a user may change about themselves. Email and role are intentionally not editable. */
public record UpdateProfileRequest(
        @NotBlank @Size(max = 100) String name,
        @Pattern(regexp = "^$|^\\d{10}$", message = "must be 10 digits") String mobileNumber,
        @Size(max = 255) String address,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Pattern(regexp = "^$|^\\d{6}$", message = "must be 6 digits") String pincode) {
}
