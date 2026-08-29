package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    @Indexed
    private long movieId;

    private String userId;
    private String userDisplayName;
    private String userProfilePictureUrl;

    /** 1-10 scale to match TMDB's rating convention */
    private double rating;

    private String text;

    private boolean spoiler;

    @Builder.Default
    private Set<String> likedByUserIds = new HashSet<>();

    @Builder.Default
    private List<ReviewReply> replies = new ArrayList<>();

    @Builder.Default
    private Set<String> reportedByUserIds = new HashSet<>();

    @Builder.Default
    private boolean hidden = false;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewReply {
        private String id;
        private String userId;
        private String userDisplayName;
        private String text;
        @Builder.Default
        private Instant createdAt = Instant.now();
    }
}
