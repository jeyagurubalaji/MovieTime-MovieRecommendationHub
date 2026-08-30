package com.movietime.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.movietime.model.DeviceToken;
import com.movietime.repository.DeviceTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class FcmService {

    private final FirebaseApp firebaseApp;
    private final DeviceTokenRepository deviceTokenRepository;

    @Autowired
    public FcmService(@Nullable FirebaseApp firebaseApp, DeviceTokenRepository deviceTokenRepository) {
        this.firebaseApp = firebaseApp;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    public boolean isEnabled() {
        return firebaseApp != null;
    }

    public void registerToken(String userId, String token) {
        deviceTokenRepository.findByToken(token).ifPresentOrElse(
                existing -> {
                    existing.setUserId(userId);
                    deviceTokenRepository.save(existing);
                },
                () -> deviceTokenRepository.save(DeviceToken.builder()
                        .userId(userId)
                        .token(token)
                        .createdAt(Instant.now())
                        .build())
        );
    }

    public void unregisterToken(String token) {
        deviceTokenRepository.findByToken(token).ifPresent(deviceTokenRepository::delete);
    }

    /** Sends to every device registered for this user. Best-effort - a bad/expired token is logged and skipped. */
    public void sendToUser(String userId, String title, String body, Map<String, String> data) {
        if (!isEnabled()) {
            log.debug("FCM not configured - skipping push for user {}: {}", userId, title);
            return;
        }

        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(userId);
        for (DeviceToken deviceToken : tokens) {
            try {
                Message message = Message.builder()
                        .setToken(deviceToken.getToken())
                        .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                        .putAllData(data != null ? data : Map.of())
                        .build();
                FirebaseMessaging.getInstance(firebaseApp).send(message);
            } catch (FirebaseMessagingException e) {
                log.warn("Failed to send FCM push to a device for user {}: {}", userId, e.getMessage());
                if (isTokenInvalid(e)) {
                    deviceTokenRepository.delete(deviceToken);
                }
            }
        }
    }

    private boolean isTokenInvalid(FirebaseMessagingException e) {
        String code = e.getMessagingErrorCode() != null ? e.getMessagingErrorCode().name() : "";
        return code.equals("UNREGISTERED") || code.equals("INVALID_ARGUMENT");
    }
}