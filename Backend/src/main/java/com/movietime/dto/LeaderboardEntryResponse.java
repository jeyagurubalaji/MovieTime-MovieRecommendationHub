package com.movietime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryResponse {
    private String userId;
    private String displayName;
    private String profilePictureUrl;
    private long points;
    private int currentStreak;
    private int badgeCount;
}
