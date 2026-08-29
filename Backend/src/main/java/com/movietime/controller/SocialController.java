package com.movietime.controller;

import com.movietime.dto.LibraryItemResponse;
import com.movietime.dto.PublicProfileResponse;
import com.movietime.dto.TopReviewerResponse;
import com.movietime.dto.TrendingReviewResponse;
import com.movietime.dto.UserResponse;
import com.movietime.model.User;
import com.movietime.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    @PostMapping("/api/social/follow/{userId}")
    public ResponseEntity<Void> follow(@AuthenticationPrincipal User user, @PathVariable String userId) {
        socialService.follow(user.getId(), userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/social/follow/{userId}")
    public ResponseEntity<Void> unfollow(@AuthenticationPrincipal User user, @PathVariable String userId) {
        socialService.unfollow(user.getId(), userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/social/{userId}/followers")
    public List<UserResponse> followers(@PathVariable String userId) {
        return socialService.getFollowers(userId).stream().map(UserResponse::fromUser).toList();
    }

    @GetMapping("/api/social/{userId}/following")
    public List<UserResponse> following(@PathVariable String userId) {
        return socialService.getFollowing(userId).stream().map(UserResponse::fromUser).toList();
    }

    @GetMapping("/api/social/top-reviewers")
    public List<TopReviewerResponse> topReviewers(@RequestParam(defaultValue = "10") int limit) {
        return socialService.getTopReviewers(limit);
    }

    @GetMapping("/api/social/trending-reviews")
    public List<TrendingReviewResponse> trendingReviews(@RequestParam(defaultValue = "10") int limit) {
        return socialService.getTrendingReviews(limit);
    }

    @GetMapping("/api/users/{userId}/public-profile")
    public PublicProfileResponse publicProfile(@AuthenticationPrincipal User currentUser, @PathVariable String userId) {
        String requestingId = currentUser != null ? currentUser.getId() : null;
        return socialService.getPublicProfile(userId, requestingId);
    }

    @GetMapping("/api/users/{userId}/public-watchlist")
    public List<LibraryItemResponse> publicWatchlist(@PathVariable String userId) {
        return socialService.getPublicWatchlist(userId).stream().map(LibraryItemResponse::fromEntity).toList();
    }
}
