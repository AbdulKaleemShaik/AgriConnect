package com.agriconnect.user;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 15)
    private String mobileNumber;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    private String profileImage;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private int failedLoginAttempts;

    /** Account is locked until this instant after too many failed logins. */
    private Instant lockedUntil;

    /** BCrypt hash of the current password-reset OTP (the raw OTP is never stored). */
    private String passwordResetOtpHash;

    private Instant passwordResetOtpExpiresAt;

    @Column(nullable = false)
    private int passwordResetAttempts;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public boolean isLocked(Instant now) {
        return lockedUntil != null && lockedUntil.isAfter(now);
    }

    public void clearPasswordReset() {
        this.passwordResetOtpHash = null;
        this.passwordResetOtpExpiresAt = null;
        this.passwordResetAttempts = 0;
    }
}
