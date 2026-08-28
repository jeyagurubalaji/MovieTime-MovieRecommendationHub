package com.movietime.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    @Value("${firebase.service-account-path:}")
    private String serviceAccountPath;

    /**
     * Returns null (not a bean failure) when Firebase isn't configured, so the app still
     * starts and boots cleanly without push notifications wired up. FcmService checks for
     * null and no-ops with a warning log instead of throwing.
     */
    @Bean
    public FirebaseApp firebaseApp() {
        try {
            InputStream credentialsStream = resolveCredentialsStream();
            if (credentialsStream == null) {
                log.warn("Firebase not configured (no FIREBASE_SERVICE_ACCOUNT_JSON or " +
                        "FIREBASE_SERVICE_ACCOUNT_PATH set). Push notifications will be disabled.");
                return null;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.initializeApp(options);
            }
            return FirebaseApp.getInstance();
        } catch (Exception e) {
            log.warn("Failed to initialize Firebase, push notifications will be disabled: {}", e.getMessage());
            return null;
        }
    }

    private InputStream resolveCredentialsStream() throws Exception {
        if (!serviceAccountJson.isBlank()) {
            return new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
        }
        if (!serviceAccountPath.isBlank() && Files.exists(Path.of(serviceAccountPath))) {
            return Files.newInputStream(Path.of(serviceAccountPath));
        }
        return null;
    }
}
