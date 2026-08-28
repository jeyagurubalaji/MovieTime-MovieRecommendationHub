package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    /** Null for users who only sign in via Google OAuth */
    private String passwordHash;

    private String displayName;

    private String profilePictureUrl;

    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    /** Google subject id, present only when provider = GOOGLE */
    private String googleId;

    @Builder.Default
    private Set<Role> roles = new HashSet<>(Set.of(Role.USER));

    @Builder.Default
    private boolean darkMode = true;

    @Builder.Default
    private List<String> preferredLanguages = new ArrayList<>();

    private String bio;

    @Builder.Default
    private boolean publicProfile = true;

    @Builder.Default
    private boolean publicWatchlist = false;

    @Builder.Default
    private String language = "en";

    @Builder.Default
    private boolean highContrastMode = false;

    @Builder.Default
    private String fontSizeScale = "normal"; // "small" | "normal" | "large" | "x-large"

    private String passwordResetToken;

    private Instant passwordResetTokenExpiry;

    @CreatedDate
    private Instant createdAt;

    private Instant lastLoginAt;

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    public enum Role {
        USER, ADMIN
    }
}
