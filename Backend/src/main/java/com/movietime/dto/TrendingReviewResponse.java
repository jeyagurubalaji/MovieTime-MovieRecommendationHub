package com.movietime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendingReviewResponse {
    private String id;
    private long movieId;
    private String userId;
    private String userDisplayName;
    private String userProfilePictureUrl;
    private double rating;
    private String text;
    private int likeCount;
    private Instant createdAt;
}
