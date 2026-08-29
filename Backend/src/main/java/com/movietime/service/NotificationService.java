package com.movietime.service;

import com.movietime.model.Notification;
import com.movietime.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FcmService fcmService;

    public List<Notification> list(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(String userId, String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /** Creates the in-app notification record AND fires a push (if FCM is configured). */
    public Notification notify(String userId, Notification.NotificationType type, String title, String body, Long movieId) {
        Notification notification = notificationRepository.save(Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .movieId(movieId)
                .read(false)
                .createdAt(Instant.now())
                .build());

        Map<String, String> data = movieId != null
                ? Map.of("type", type.name(), "movieId", String.valueOf(movieId))
                : Map.of("type", type.name());
        fcmService.sendToUser(userId, title, body, data);

        return notification;
    }
}
