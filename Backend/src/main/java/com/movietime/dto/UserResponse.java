package com.movietime.dto;

import com.movietime.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String email;
    private String displayName;
    private String profilePictureUrl;
    private boolean darkMode;
    private Set<User.Role> roles;
    private String bio;
    private boolean publicProfile;
    private boolean publicWatchlist;
    private String language;
    private boolean highContrastMode;
    private String fontSizeScale;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .darkMode(user.isDarkMode())
                .roles(user.getRoles())
                .bio(user.getBio())
                .publicProfile(user.isPublicProfile())
                .publicWatchlist(user.isPublicWatchlist())
                .language(user.getLanguage())
                .highContrastMode(user.isHighContrastMode())
                .fontSizeScale(user.getFontSizeScale())
                .build();
    }
}
