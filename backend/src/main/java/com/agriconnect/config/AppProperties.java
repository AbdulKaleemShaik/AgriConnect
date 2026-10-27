package com.agriconnect.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Type-safe view of the {@code app.*} properties. Values come from environment
 * variables (see application.properties) so no secret lives in source control.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        @DefaultValue Jwt jwt,
        @DefaultValue Security security,
        @DefaultValue Cors cors,
        @DefaultValue Admin admin,
        @DefaultValue Storage storage,
        @DefaultValue Mail mail) {

    public record Jwt(String secret, @DefaultValue("PT24H") Duration expiration) {
    }

    public record Security(@DefaultValue("5") int maxFailedLogins,
                           @DefaultValue("PT15M") Duration lockDuration) {
    }

    public record Cors(@DefaultValue("http://localhost:5173") List<String> allowedOrigins) {
    }

    public record Admin(String email, String password) {
    }

    public record Storage(@DefaultValue("./uploads") String uploadDir) {
    }

    public record Mail(@DefaultValue("false") boolean enabled,
                       @DefaultValue("no-reply@agriconnect.local") String from) {
    }
}
