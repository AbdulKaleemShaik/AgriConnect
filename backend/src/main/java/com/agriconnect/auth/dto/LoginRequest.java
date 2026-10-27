package com.agriconnect.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;

/** {@code username} is accepted as an alias of {@code email} for older clients. */
public record LoginRequest(
        @NotBlank @JsonAlias("username") String email,
        @NotBlank String password) {
}
