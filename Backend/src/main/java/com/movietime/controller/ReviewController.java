package com.movietime.controller;

import com.movietime.dto.ReplyRequest;
import com.movietime.dto.ReviewRequest;
import com.movietime.dto.ReviewResponse;
import com.movietime.model.Review;
import com.movietime.model.User;
import com.movietime.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/movie/{movieId}")
    public List<ReviewResponse> getReviewsForMovie(@PathVariable long movieId,
                                                     @AuthenticationPrincipal User user) {
        String currentUserId = user != null ? user.getId() : null;
        return reviewService.getReviewsForMovie(movieId).stream()
                .map(r -> ReviewResponse.from(r, currentUserId))
                .toList();
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@AuthenticationPrincipal User user,
                                                         @Valid @RequestBody ReviewRequest request) {
        Review review = reviewService.createReview(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ReviewResponse.from(review, user.getId()));
    }

    @PostMapping("/{id}/like")
    public ReviewResponse toggleLike(@PathVariable String id, @AuthenticationPrincipal User user) {
        Review review = reviewService.toggleLike(id, user.getId());
        return ReviewResponse.from(review, user.getId());
    }

    @PostMapping("/{id}/reply")
    public ReviewResponse reply(@PathVariable String id, @AuthenticationPrincipal User user,
                                 @Valid @RequestBody ReplyRequest request) {
        Review review = reviewService.addReply(id, user, request);
        return ReviewResponse.from(review, user.getId());
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Map<String, String>> report(@PathVariable String id, @AuthenticationPrincipal User user) {
        reviewService.reportReview(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Review reported. Thanks for helping keep MovieTime clean."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal User user) {
        reviewService.deleteReview(id, user);
        return ResponseEntity.noContent().build();
    }
}
