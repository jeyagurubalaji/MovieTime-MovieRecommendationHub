package com.movietime.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.movietime.dto.*;
import com.movietime.exception.ApiException;
import com.movietime.model.User;
import com.movietime.repository.UserRepository;
import com.movietime.security.GoogleTokenVerifier;
import com.movietime.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final EmailService emailService;
    private final GamificationService gamificationService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .provider(User.AuthProvider.LOCAL)
                .createdAt(Instant.now())
                .lastLoginAt(Instant.now())
                .build();

        userRepository.save(user);
        gamificationService.checkIn(user.getId());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (user.getProvider() == User.AuthProvider.GOOGLE || user.getPasswordHash() == null) {
            throw new ApiException("This account uses Google Sign-In. Please continue with Google.", HttpStatus.CONFLICT);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
        gamificationService.checkIn(user.getId());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(user))
                .build();
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getIdToken());

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> User.builder()
                        .email(email.toLowerCase().trim())
                        .displayName(name != null ? name : email)
                        .profilePictureUrl(picture)
                        .provider(User.AuthProvider.GOOGLE)
                        .googleId(googleId)
                        .createdAt(Instant.now())
                        .build());

        // Link Google to an existing local account on first Google sign-in
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            if (user.getProfilePictureUrl() == null) {
                user.setProfilePictureUrl(picture);
            }
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
        gamificationService.checkIn(user.getId());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(user))
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase().trim()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetTokenExpiry(Instant.now().plusSeconds(3600)); // 1 hour
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        });
        // Always respond as success to avoid leaking which emails are registered
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new ApiException("Invalid or expired reset token", HttpStatus.BAD_REQUEST));

        if (user.getPasswordResetTokenExpiry() == null
                || user.getPasswordResetTokenExpiry().isBefore(Instant.now())) {
            throw new ApiException("Reset token has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }
}
