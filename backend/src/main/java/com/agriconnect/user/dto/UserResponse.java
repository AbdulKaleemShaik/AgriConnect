package com.agriconnect.user.dto;

import java.time.Instant;

import com.agriconnect.common.storage.ImageFolder;
import com.agriconnect.user.Role;
import com.agriconnect.user.User;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        String mobileNumber,
        String address,
        String city,
        String state,
        String pincode,
        String profileImage,
        String profileImageUrl,
        boolean enabled,
        Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.getMobileNumber(), user.getAddress(), user.getCity(), user.getState(), user.getPincode(),
                user.getProfileImage(), ImageFolder.PROFILES.urlFor(user.getProfileImage()),
                user.isEnabled(), user.getCreatedAt());
    }
}
