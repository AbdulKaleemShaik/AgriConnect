package com.agriconnect.security;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.agriconnect.common.exception.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Writes the same {@link ApiError} JSON for 401/403 raised by the security filter chain. */
@Component
public class RestAuthenticationHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RestAuthenticationHandlers(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        write(response, request, HttpStatus.UNAUTHORIZED, "Authentication is required to access this resource");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        write(response, request, HttpStatus.FORBIDDEN, "You do not have permission to perform this action");
    }

    private void write(HttpServletResponse response, HttpServletRequest request, HttpStatus status,
                       String message) throws IOException {
        ApiError body = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message,
                request.getRequestURI(), List.of());
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
