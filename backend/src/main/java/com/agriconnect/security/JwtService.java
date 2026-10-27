package com.agriconnect.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.agriconnect.config.AppProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/** Issues and verifies HS256-signed access tokens. */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey key;
    private final Duration expiration;

    public JwtService(AppProperties properties) {
        String secret = properties.jwt().secret();
        if (secret == null || secret.isBlank()) {
            log.warn("JWT_SECRET is not set - using a random signing key. "
                    + "Tokens will be invalid after a restart. Set JWT_SECRET outside local development.");
            this.key = Jwts.SIG.HS256.key().build();
        } else {
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < MIN_SECRET_BYTES) {
                throw new IllegalStateException("JWT_SECRET must be at least " + MIN_SECRET_BYTES + " bytes long");
            }
            this.key = Keys.hmacShaKeyFor(bytes);
        }
        this.expiration = properties.jwt().expiration();
    }

    public String generateToken(AppUserDetails user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("uid", user.getId())
                .claim("role", user.getRole().authority())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(key)
                .compact();
    }

    /** Returns the subject (email) of a valid, unexpired token; empty for anything else. */
    public Optional<String> extractValidSubject(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Rejected JWT: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public long getExpirationSeconds() {
        return expiration.toSeconds();
    }
}
