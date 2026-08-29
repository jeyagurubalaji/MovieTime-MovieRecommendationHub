package com.movietime.dto;

import com.movietime.model.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private String id;
    private long movieId;
    private String userId;
    private String userDisplayName;
    private String userProfilePictureUrl;
    private double rating;
    private String text;
    private boolean spoiler;
    private int likeCount;
    private boolean likedByCurrentUser;
    private List<Review.ReviewReply> replies;
    private Instant createdAt;

    public static ReviewResponse from(Review review, String currentUserId) {
        return ReviewResponse.builder()
                .id(review.getId())
                .movieId(review.getMovieId())
                .userId(review.getUserId())
                .userDisplayName(review.getUserDisplayName())
                .userProfilePictureUrl(review.getUserProfilePictureUrl())
                .rating(review.getRating())
                .text(review.getText())
                .spoiler(review.isSpoiler())
                .likeCount(review.getLikedByUserIds().size())
                .likedByCurrentUser(currentUserId != null && review.getLikedByUserIds().contains(currentUserId))
                .replies(review.getReplies())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
