package com.movietime.controller;

import com.movietime.dto.UserResponse;
import com.movietime.model.User;
import com.movietime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal User user) {
        return UserResponse.fromUser(user);
    }

    @PatchMapping("/me/theme")
    public UserResponse updateTheme(@AuthenticationPrincipal User user, @RequestBody Map<String, Boolean> body) {
        user.setDarkMode(body.getOrDefault("darkMode", true));
        userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    @PatchMapping("/me/profile-picture")
    public UserResponse updateProfilePicture(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        user.setProfilePictureUrl(body.get("profilePictureUrl"));
        userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    @PatchMapping("/me/display-name")
    public UserResponse updateDisplayName(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        user.setDisplayName(body.get("displayName"));
        userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    @PatchMapping("/me/bio")
    public UserResponse updateBio(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        user.setBio(body.get("bio"));
        userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    @PatchMapping("/me/privacy")
    public UserResponse updatePrivacy(@AuthenticationPrincipal User user, @RequestBody Map<String, Boolean> body) {
        if (body.containsKey("publicProfile")) {
            user.setPublicProfile(body.get("publicProfile"));
        }
        if (body.containsKey("publicWatchlist")) {
            user.setPublicWatchlist(body.get("publicWatchlist"));
        }
        userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    @PatchMapping("/me/accessibility")
    public UserResponse updateAccessibility(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> body) {
        if (body.containsKey("language")) {
            user.setLanguage((String) body.get("language"));
        }
        if (body.containsKey("highContrastMode")) {
            user.setHighContrastMode((Boolean) body.get("highContrastMode"));
        }
        if (body.containsKey("fontSizeScale")) {
            user.setFontSizeScale((String) body.get("fontSizeScale"));
        }
        userRepository.save(user);
        return UserResponse.fromUser(user);
    }
}
