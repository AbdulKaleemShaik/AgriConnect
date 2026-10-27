package com.agriconnect.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.agriconnect.auth.dto.AuthResponse;
import com.agriconnect.auth.dto.ForgotPasswordRequest;
import com.agriconnect.auth.dto.LoginRequest;
import com.agriconnect.auth.dto.RegisterRequest;
import com.agriconnect.auth.dto.ResetPasswordRequest;
import com.agriconnect.user.Role;
import com.agriconnect.user.dto.UserResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
@SecurityRequirements // public endpoints: no bearer token required
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(path = "/register/customer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a customer account (multipart form, optional 'image' part)")
    public UserResponse registerCustomer(@Valid @ModelAttribute RegisterRequest request,
                                         @RequestPart(name = "image", required = false) MultipartFile image) {
        return authService.register(request, image, Role.CUSTOMER);
    }

    @PostMapping(path = "/register/farmer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a farmer (seller) account (multipart form, optional 'image' part)")
    public UserResponse registerFarmer(@Valid @ModelAttribute RegisterRequest request,
                                       @RequestPart(name = "image", required = false) MultipartFile image) {
        return authService.register(request, image, Role.FARMER);
    }

    @PostMapping("/login")
    @Operation(summary = "Exchange email + password for a JWT access token")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Email a 6-digit password reset code (always returns 202)")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Set a new password using the emailed reset code")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }
}
