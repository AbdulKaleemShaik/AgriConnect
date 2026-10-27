package com.agriconnect.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.agriconnect.TestData;
import com.agriconnect.auth.dto.AuthResponse;
import com.agriconnect.auth.dto.LoginRequest;
import com.agriconnect.auth.dto.RegisterRequest;
import com.agriconnect.auth.dto.ResetPasswordRequest;
import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.common.exception.ConflictException;
import com.agriconnect.common.storage.FileStorageService;
import com.agriconnect.config.AppProperties;
import com.agriconnect.notification.EmailRequestedEvent;
import com.agriconnect.security.AppUserDetails;
import com.agriconnect.security.JwtService;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;
import com.agriconnect.user.UserRepository;
import com.agriconnect.user.dto.UserResponse;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final Instant NOW = Instant.parse("2026-01-01T10:00:00Z");

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;
    @Mock FileStorageService fileStorage;
    @Mock ApplicationEventPublisher events;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties(new AppProperties.Jwt(null, Duration.ofHours(1)),
                new AppProperties.Security(3, Duration.ofMinutes(15)),
                new AppProperties.Cors(List.of()), new AppProperties.Admin(null, null),
                new AppProperties.Storage("target/test-uploads"), new AppProperties.Mail(false, "x@y.z"));
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, jwtService,
                fileStorage, events, properties, Clock.fixed(NOW, ZoneOffset.UTC));
    }

    private static RegisterRequest registerRequest(String email) {
        return new RegisterRequest("Ravi Kumar", email, "secret123", "9876543210", "Main road", "Guntur",
                "Andhra Pradesh", "522001");
    }

    @Test
    void registerHashesPasswordNormalizesEmailAndAssignsRole() {
        when(userRepository.existsByEmailIgnoreCase("ravi@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = authService.register(registerRequest("  Ravi@Example.com "), null, Role.FARMER);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getPassword()).isEqualTo("hashed");
        assertThat(saved.getValue().getEmail()).isEqualTo("ravi@example.com");
        assertThat(response.role()).isEqualTo(Role.FARMER);
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("ravi@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest("ravi@example.com"), null, Role.CUSTOMER))
                .isInstanceOf(ConflictException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerNeverCreatesAdmins() {
        assertThatThrownBy(() -> authService.register(registerRequest("a@example.com"), null, Role.ADMIN))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void loginReturnsTokenAndResetsFailedAttempts() {
        User user = TestData.user(5, Role.CUSTOMER);
        user.setFailedLoginAttempts(2);
        AppUserDetails principal = AppUserDetails.from(user);
        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(principal)).thenReturn("jwt-token");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        AuthResponse response = authService.login(new LoginRequest(user.getEmail(), "pw"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.role()).isEqualTo("ROLE_CUSTOMER");
        assertThat(user.getFailedLoginAttempts()).isZero();
        verify(userRepository).save(user);
    }

    @Test
    void failedLoginIncrementsCounterAndLocksAfterLimit() {
        User user = TestData.user(5, Role.CUSTOMER);
        user.setFailedLoginAttempts(2); // limit is 3 in this test
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest(user.getEmail(), "wrong")))
                .isInstanceOf(BadCredentialsException.class);

        assertThat(user.getLockedUntil()).isEqualTo(NOW.plus(Duration.ofMinutes(15)));
        assertThat(user.getFailedLoginAttempts()).isZero();
        verify(userRepository).save(user);
    }

    @Test
    void forgotPasswordStoresHashedOtpAndPublishesEmail() {
        User user = TestData.user(5, Role.CUSTOMER);
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("otp-hash");

        authService.requestPasswordReset(user.getEmail());

        assertThat(user.getPasswordResetOtpHash()).isEqualTo("otp-hash");
        assertThat(user.getPasswordResetOtpExpiresAt()).isEqualTo(NOW.plus(Duration.ofMinutes(10)));
        ArgumentCaptor<EmailRequestedEvent> event = ArgumentCaptor.forClass(EmailRequestedEvent.class);
        verify(events).publishEvent(event.capture());
        assertThat(event.getValue().to()).isEqualTo(user.getEmail());
        assertThat(event.getValue().body()).containsPattern("\\d{6}");
    }

    @Test
    void forgotPasswordForUnknownEmailIsSilent() {
        when(userRepository.findByEmailIgnoreCase("nobody@example.com")).thenReturn(Optional.empty());

        authService.requestPasswordReset("nobody@example.com");

        verify(events, never()).publishEvent(any());
    }

    @Test
    void resetPasswordWithValidOtpChangesPassword() {
        User user = TestData.user(5, Role.CUSTOMER);
        user.setPasswordResetOtpHash("otp-hash");
        user.setPasswordResetOtpExpiresAt(NOW.plusSeconds(60));
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "otp-hash")).thenReturn(true);
        when(passwordEncoder.encode("newSecret1")).thenReturn("new-hash");

        authService.resetPassword(new ResetPasswordRequest(user.getEmail(), "123456", "newSecret1"));

        assertThat(user.getPassword()).isEqualTo("new-hash");
        assertThat(user.getPasswordResetOtpHash()).isNull();
    }

    @Test
    void resetPasswordRejectsExpiredOtp() {
        User user = TestData.user(5, Role.CUSTOMER);
        user.setPasswordResetOtpHash("otp-hash");
        user.setPasswordResetOtpExpiresAt(NOW.minusSeconds(1));
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.resetPassword(
                new ResetPasswordRequest(user.getEmail(), "123456", "newSecret1")))
                .isInstanceOf(BadRequestException.class);
        verify(passwordEncoder, never()).encode(eq("newSecret1"));
    }

    @Test
    void resetPasswordCountsWrongOtpAttempts() {
        User user = TestData.user(5, Role.CUSTOMER);
        user.setPasswordResetOtpHash("otp-hash");
        user.setPasswordResetOtpExpiresAt(NOW.plusSeconds(60));
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("000000", "otp-hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.resetPassword(
                new ResetPasswordRequest(user.getEmail(), "000000", "newSecret1")))
                .isInstanceOf(BadRequestException.class);
        assertThat(user.getPasswordResetAttempts()).isEqualTo(1);
    }
}
