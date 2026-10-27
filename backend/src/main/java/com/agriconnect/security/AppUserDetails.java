package com.agriconnect.security;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.agriconnect.user.Role;
import com.agriconnect.user.User;

/** Security principal; a detached snapshot of the user so no JPA entity leaks into the security context. */
public class AppUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String name;
    private final String password;
    private final Role role;
    private final boolean enabled;
    private final boolean locked;

    public AppUserDetails(Long id, String email, String name, String password, Role role,
                          boolean enabled, boolean locked) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
        this.enabled = enabled;
        this.locked = locked;
    }

    public static AppUserDetails from(User user) {
        return new AppUserDetails(user.getId(), user.getEmail(), user.getName(), user.getPassword(),
                user.getRole(), user.isEnabled(), user.isLocked(Instant.now()));
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Role getRole() {
        return role;
    }

    public boolean hasRole(Role candidate) {
        return role == candidate;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.authority()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
