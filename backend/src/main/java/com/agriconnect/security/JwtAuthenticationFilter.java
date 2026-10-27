package com.agriconnect.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Authenticates requests carrying {@code Authorization: Bearer <jwt>}.
 * Invalid or expired tokens are ignored, so the request proceeds anonymously and
 * protected endpoints answer 401 through the configured entry point.
 * Not a Spring bean on purpose: it is added only to the security filter chain.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            jwtService.extractValidSubject(header.substring(BEARER_PREFIX.length()))
                    .ifPresent(email -> authenticate(email, request));
        }
        filterChain.doFilter(request, response);
    }

    private void authenticate(String email, HttpServletRequest request) {
        UserDetails user;
        try {
            user = userDetailsService.loadUserByUsername(email);
        } catch (UsernameNotFoundException e) {
            return;
        }
        // A disabled or locked account loses access immediately, even with an unexpired token.
        if (!user.isEnabled() || !user.isAccountNonLocked()) {
            return;
        }
        var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
