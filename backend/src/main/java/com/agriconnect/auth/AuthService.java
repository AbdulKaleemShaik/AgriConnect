package com.agriconnect.auth;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.agriconnect.auth.dto.AuthResponse;
import com.agriconnect.auth.dto.LoginRequest;
import com.agriconnect.auth.dto.RegisterRequest;
import com.agriconnect.auth.dto.ResetPasswordRequest;
import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.common.exception.ConflictException;
import com.agriconnect.common.storage.FileStorageService;
import com.agriconnect.common.storage.ImageFolder;
import com.agriconnect.config.AppProperties;
import com.agriconnect.notification.EmailRequestedEvent;
import com.agriconnect.security.AppUserDetails;
import com.agriconnect.security.JwtService;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;
import com.agriconnect.user.UserRepository;
import com.agriconnect.user.dto.UserResponse;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final Duration OTP_TTL = Duration.ofMinutes(10);
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final String INVALID_OTP = "Invalid or expired reset code";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final FileStorageService fileStorage;
    private final ApplicationEventPublisher events;
    private final AppProperties properties;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       FileStorageService fileStorage, ApplicationEventPublisher events,
                       AppProperties properties, Clock clock) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.fileStorage = fileStorage;
        this.events = events;
        this.properties = properties;
        this.clock = clock;
    }

    /** Self-registration is only possible for CUSTOMER and FARMER; admins are provisioned out of band. */
    @Transactional
    public UserResponse register(RegisterRequest request, MultipartFile image, Role role) {
        if (role == Role.ADMIN) {
            throw new IllegalArgumentException("Admins cannot self-register");
        }
        String email = normalize(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setEnabled(true);
        user.setMobileNumber(request.mobileNumber());
        user.setAddress(request.address());
        user.setCity(request.city());
        user.setState(request.state());
        user.setPincode(request.pincode());
        user.setProfileImage(fileStorage.store(image, ImageFolder.PROFILES));
        return UserResponse.from(userRepository.save(user));
    }

    /**
     * Authenticates and issues a JWT. Each failure is counted; after
     * {@code app.security.max-failed-logins} the account is locked for {@code lock-duration}.
     * Intentionally not @Transactional: the failed-attempt counter must be persisted
     * even though the method then throws.
     */
    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.email());
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (BadCredentialsException e) {
            userRepository.findByEmailIgnoreCase(email).ifPresent(this::recordFailedLogin);
            throw e;
        }

        AppUserDetails principal = (AppUserDetails) authentication.getPrincipal();
        userRepository.findById(principal.getId())
                .filter(user -> user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null)
                .ifPresent(user -> {
                    user.setFailedLoginAttempts(0);
                    user.setLockedUntil(null);
                    userRepository.save(user);
                });

        return new AuthResponse(jwtService.generateToken(principal), "Bearer", jwtService.getExpirationSeconds(),
                principal.getId(), principal.getName(), principal.getUsername(), principal.getRole().authority());
    }

    private void recordFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        if (attempts >= properties.security().maxFailedLogins()) {
            user.setLockedUntil(Instant.now(clock).plus(properties.security().lockDuration()));
            user.setFailedLoginAttempts(0);
            log.info("Locked account {} after {} failed logins", user.getEmail(), attempts);
        } else {
            user.setFailedLoginAttempts(attempts);
        }
        userRepository.save(user);
    }

    /**
     * Emails a one-time code. Responds identically whether or not the email exists,
     * so the endpoint cannot be used to discover registered accounts.
     */
    @Transactional
    public void requestPasswordReset(String rawEmail) {
        userRepository.findByEmailIgnoreCase(normalize(rawEmail)).ifPresent(user -> {
            String otp = "%06d".formatted(random.nextInt(1_000_000));
            user.setPasswordResetOtpHash(passwordEncoder.encode(otp));
            user.setPasswordResetOtpExpiresAt(Instant.now(clock).plus(OTP_TTL));
            user.setPasswordResetAttempts(0);
            events.publishEvent(new EmailRequestedEvent(user.getEmail(), "AgriConnect password reset code",
                    "Your password reset code is " + otp + ". It expires in " + OTP_TTL.toMinutes()
                            + " minutes. If you did not request this, you can ignore this email."));
        });
    }

    @Transactional(noRollbackFor = BadRequestException.class)
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalize(request.email()))
                .orElseThrow(() -> new BadRequestException(INVALID_OTP));

        boolean usable = user.getPasswordResetOtpHash() != null
                && user.getPasswordResetOtpExpiresAt() != null
                && user.getPasswordResetOtpExpiresAt().isAfter(Instant.now(clock))
                && user.getPasswordResetAttempts() < MAX_OTP_ATTEMPTS;
        if (!usable) {
            user.clearPasswordReset();
            throw new BadRequestException(INVALID_OTP);
        }
        if (!passwordEncoder.matches(request.otp(), user.getPasswordResetOtpHash())) {
            user.setPasswordResetAttempts(user.getPasswordResetAttempts() + 1);
            throw new BadRequestException(INVALID_OTP);
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.clearPasswordReset();
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
