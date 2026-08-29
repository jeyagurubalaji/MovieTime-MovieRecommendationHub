package com.movietime.repository;

import com.movietime.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserIdAndReadFalse(String userId);
    boolean existsByUserIdAndMovieIdAndType(String userId, long movieId, Notification.NotificationType type);
}
