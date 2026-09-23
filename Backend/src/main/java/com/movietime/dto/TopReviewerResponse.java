package com.movietime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopReviewerResponse {
    private String userId;
    private String displayName;
    private String profilePictureUrl;
    private long reviewCount;
    private long totalLikesReceived;
}
