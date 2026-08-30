package com.movietime.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    @Value("${firebase.service-account-path:}")
    private String serviceAccountPath;

    @Bean
    public FirebaseApp firebaseApp() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        try (InputStream serviceAccount = resolveServiceAccountStream()) {
            if (serviceAccount == null) {
                log.warn("No Firebase credentials provided. Push notifications will be disabled.");
                return null;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            return FirebaseApp.initializeApp(options);
        } catch (Exception e) {
            log.error("Failed to initialize Firebase: {}", e.getMessage(), e);
            return null;
        }
    }

    private InputStream resolveServiceAccountStream() throws Exception {
        if (serviceAccountJson != null && !serviceAccountJson.trim().isEmpty()) {
            return new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
        }

        if (serviceAccountPath != null && !serviceAccountPath.trim().isEmpty()) {
            String path = serviceAccountPath.replace("classpath:", "").trim();
            ClassPathResource classPathResource = new ClassPathResource(path);
            if (classPathResource.exists()) {
                return classPathResource.getInputStream();
            }

            File file = new File(serviceAccountPath);
            if (file.exists()) {
                return new FileInputStream(file);
            }
        }

        return null;
    }
}