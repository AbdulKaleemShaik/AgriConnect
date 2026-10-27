package com.agriconnect.user;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.agriconnect.security.AppUserDetails;
import com.agriconnect.user.dto.ChangePasswordRequest;
import com.agriconnect.user.dto.UpdateProfileRequest;
import com.agriconnect.user.dto.UserResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me")
@Tag(name = "Profile", description = "The authenticated user's own profile")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get the current user's profile")
    public UserResponse me(@AuthenticationPrincipal AppUserDetails me) {
        return userService.getProfile(me.getId());
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update the current user's profile (multipart form, optional 'image' part)")
    public UserResponse updateProfile(@AuthenticationPrincipal AppUserDetails me,
                                      @Valid @ModelAttribute UpdateProfileRequest request,
                                      @RequestPart(name = "image", required = false) MultipartFile image) {
        return userService.updateProfile(me.getId(), request, image);
    }

    @PutMapping("/password")
    @Operation(summary = "Change the current user's password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal AppUserDetails me,
                                               @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(me.getId(), request);
        return ResponseEntity.noContent().build();
    }
}
