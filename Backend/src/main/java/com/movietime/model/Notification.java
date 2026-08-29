package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private NotificationType type;
    private String title;
    private String body;
    private Long movieId;

    @Builder.Default
    private boolean read = false;

    @Builder.Default
    private Instant createdAt = Instant.now();

    public enum NotificationType {
        NEW_RELEASE, UPCOMING_MOVIE, FAVORITE_ACTOR_NEW_MOVIE, WATCHLIST_REMINDER
    }
}
