package com.agriconnect.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^\\d{6}$", message = "must be the 6-digit code from the email") String otp,
        @NotBlank @Size(min = 8, max = 72) String newPassword) {
}
