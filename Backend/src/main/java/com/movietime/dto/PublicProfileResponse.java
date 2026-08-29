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
public class PublicProfileResponse {
    private String id;
    private String displayName;
    private String profilePictureUrl;
    private String bio;
    private Instant memberSince;
    private long followerCount;
    private long followingCount;
    private long reviewCount;
    private long moviesWatchedCount;
    private boolean isFollowedByCurrentUser;
    private boolean watchlistPublic;
    private long points;
    private int currentStreak;
    private java.util.List<com.movietime.model.GamificationProfile.Badge> badges;
}
