package com.agriconnect.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.agriconnect.common.exception.BadRequestException;
import com.agriconnect.common.exception.ResourceNotFoundException;
import com.agriconnect.common.storage.FileStorageService;
import com.agriconnect.common.storage.ImageFolder;
import com.agriconnect.user.dto.ChangePasswordRequest;
import com.agriconnect.user.dto.UpdateProfileRequest;
import com.agriconnect.user.dto.UserResponse;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorage;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       FileStorageService fileStorage) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorage = fileStorage;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return UserResponse.from(findUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request, MultipartFile image) {
        User user = findUser(userId);
        user.setName(request.name().trim());
        user.setMobileNumber(request.mobileNumber());
        user.setAddress(request.address());
        user.setCity(request.city());
        user.setState(request.state());
        user.setPincode(request.pincode());

        String newImage = fileStorage.store(image, ImageFolder.PROFILES);
        if (newImage != null) {
            fileStorage.delete(user.getProfileImage(), ImageFolder.PROFILES);
            user.setProfileImage(newImage);
        }
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(Role role, Pageable pageable) {
        Page<User> page = role == null ? userRepository.findAll(pageable) : userRepository.findByRole(role, pageable);
        return page.map(UserResponse::from);
    }

    @Transactional
    public UserResponse setEnabled(Long targetUserId, boolean enabled, Long actingAdminId) {
        if (targetUserId.equals(actingAdminId) && !enabled) {
            throw new BadRequestException("Administrators cannot disable their own account");
        }
        User user = findUser(targetUserId);
        user.setEnabled(enabled);
        return UserResponse.from(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }
}
