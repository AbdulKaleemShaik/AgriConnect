package com.agriconnect.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.agriconnect.TestData;
import com.agriconnect.config.AppProperties;
import com.agriconnect.user.Role;

class JwtServiceTest {

    private static AppProperties props(String secret, Duration expiration) {
        return new AppProperties(new AppProperties.Jwt(secret, expiration),
                new AppProperties.Security(5, Duration.ofMinutes(15)),
                new AppProperties.Cors(List.of("http://localhost:5173")),
                new AppProperties.Admin(null, null),
                new AppProperties.Storage("target/test-uploads"),
                new AppProperties.Mail(false, "test@example.com"));
    }

    private final JwtService jwtService =
            new JwtService(props("unit-test-secret-that-is-definitely-32-bytes", Duration.ofHours(1)));

    @Test
    void generatedTokenRoundTripsToSubject() {
        AppUserDetails user = TestData.principal(TestData.user(7, Role.FARMER));

        String token = jwtService.generateToken(user);

        assertThat(jwtService.extractValidSubject(token)).contains("farmer7@example.com");
        assertThat(jwtService.getExpirationSeconds()).isEqualTo(3600);
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = jwtService.generateToken(TestData.principal(TestData.user(1, Role.CUSTOMER)));
        int signatureStart = token.lastIndexOf('.') + 1;
        char first = token.charAt(signatureStart);
        String tampered = token.substring(0, signatureStart) + (first == 'A' ? 'B' : 'A')
                + token.substring(signatureStart + 1);

        assertThat(jwtService.extractValidSubject(tampered)).isEmpty();
        assertThat(jwtService.extractValidSubject("not-a-jwt")).isEmpty();
    }

    @Test
    void tokenSignedWithAnotherKeyIsRejected() {
        JwtService other = new JwtService(props("another-secret-that-is-also-at-least-32-bytes", Duration.ofHours(1)));
        String foreignToken = other.generateToken(TestData.principal(TestData.user(1, Role.ADMIN)));

        assertThat(jwtService.extractValidSubject(foreignToken)).isEmpty();
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService shortLived = new JwtService(props("unit-test-secret-that-is-definitely-32-bytes",
                Duration.ofSeconds(-1)));
        String token = shortLived.generateToken(TestData.principal(TestData.user(1, Role.CUSTOMER)));

        assertThat(shortLived.extractValidSubject(token)).isEmpty();
    }

    @Test
    void shortSecretFailsFast() {
        assertThatThrownBy(() -> new JwtService(props("too-short", Duration.ofHours(1))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    void missingSecretFallsBackToRandomKey() {
        JwtService random = new JwtService(props("", Duration.ofHours(1)));
        String token = random.generateToken(TestData.principal(TestData.user(3, Role.CUSTOMER)));

        assertThat(random.extractValidSubject(token)).contains("customer3@example.com");
    }
}
