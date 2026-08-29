package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "gamification_profiles")
public class GamificationProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Builder.Default
    private long points = 0;

    @Builder.Default
    private int currentStreak = 0;

    @Builder.Default
    private int longestStreak = 0;

    private LocalDate lastCheckInDate;

    @Builder.Default
    private List<Badge> badges = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Badge {
        private String id;
        private String name;
        private String description;
        private String icon;
        @Builder.Default
        private Instant earnedAt = Instant.now();
    }
}
