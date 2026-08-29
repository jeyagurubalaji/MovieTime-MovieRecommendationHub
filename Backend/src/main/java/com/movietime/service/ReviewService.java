package com.movietime.service;

import com.movietime.dto.ReplyRequest;
import com.movietime.dto.ReviewRequest;
import com.movietime.exception.ApiException;
import com.movietime.model.Review;
import com.movietime.model.User;
import com.movietime.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final int REPORT_HIDE_THRESHOLD = 5;

    private final ReviewRepository reviewRepository;
    private final GamificationService gamificationService;

    public List<Review> getReviewsForMovie(long movieId) {
        return reviewRepository.findByMovieIdAndHiddenFalseOrderByCreatedAtDesc(movieId);
    }

    public Review createReview(User user, ReviewRequest request) {
        Review review = Review.builder()
                .movieId(request.getMovieId())
                .userId(user.getId())
                .userDisplayName(user.getDisplayName())
                .userProfilePictureUrl(user.getProfilePictureUrl())
                .rating(request.getRating())
                .text(request.getText())
                .spoiler(request.isSpoiler())
                .createdAt(Instant.now())
                .build();
        Review saved = reviewRepository.save(review);

        long totalReviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size();
        gamificationService.onReviewWritten(user.getId(), totalReviews);

        return saved;
    }

    public Review toggleLike(String reviewId, String userId) {
        Review review = getOrThrow(reviewId);
        if (review.getLikedByUserIds().contains(userId)) {
            review.getLikedByUserIds().remove(userId);
        } else {
            review.getLikedByUserIds().add(userId);
        }
        return reviewRepository.save(review);
    }

    public Review addReply(String reviewId, User user, ReplyRequest request) {
        Review review = getOrThrow(reviewId);
        Review.ReviewReply reply = Review.ReviewReply.builder()
                .id(UUID.randomUUID().toString())
                .userId(user.getId())
                .userDisplayName(user.getDisplayName())
                .text(request.getText())
                .createdAt(Instant.now())
                .build();
        review.getReplies().add(reply);
        return reviewRepository.save(review);
    }

    public void reportReview(String reviewId, String userId) {
        Review review = getOrThrow(reviewId);
        review.getReportedByUserIds().add(userId);
        if (review.getReportedByUserIds().size() >= REPORT_HIDE_THRESHOLD) {
            review.setHidden(true);
        }
        reviewRepository.save(review);
    }

    public void deleteReview(String reviewId, User user) {
        Review review = getOrThrow(reviewId);
        boolean isOwner = review.getUserId().equals(user.getId());
        boolean isAdmin = user.getRoles().contains(User.Role.ADMIN);
        if (!isOwner && !isAdmin) {
            throw new ApiException("You can only delete your own reviews", HttpStatus.FORBIDDEN);
        }
        reviewRepository.deleteById(reviewId);
    }

    private Review getOrThrow(String reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ApiException("Review not found", HttpStatus.NOT_FOUND));
    }
}
