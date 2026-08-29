package com.movietime.controller;

import com.movietime.dto.UserResponse;
import com.movietime.model.FeaturedMovie;
import com.movietime.model.Review;
import com.movietime.model.User;
import com.movietime.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<UserResponse> getUsers(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "50") int size) {
        return adminService.getUsers(page, size).stream().map(UserResponse::fromUser).toList();
    }

    @PatchMapping("/users/{userId}/admin-role")
    public UserResponse setAdminRole(@PathVariable String userId, @RequestBody Map<String, Boolean> body) {
        User updated = adminService.setAdminRole(userId, body.getOrDefault("isAdmin", false));
        return UserResponse.fromUser(updated);
    }

    @DeleteMapping("/users/{userId}")
    public void deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
    }

    @GetMapping("/reviews")
    public List<Review> getReviews(@RequestParam(defaultValue = "false") boolean onlyReported) {
        return adminService.getReviewsForModeration(onlyReported);
    }

    @PatchMapping("/reviews/{reviewId}/hide")
    public void hideReview(@PathVariable String reviewId, @RequestBody Map<String, Boolean> body) {
        adminService.setReviewHidden(reviewId, body.getOrDefault("hidden", true));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public void deleteReview(@PathVariable String reviewId) {
        adminService.deleteReview(reviewId);
    }

    @GetMapping("/featured-movies")
    public List<FeaturedMovie> getFeaturedMovies() {
        return adminService.getFeaturedMovies();
    }

    @PostMapping("/featured-movies")
    public FeaturedMovie addFeaturedMovie(@RequestBody Map<String, Object> body) {
        return adminService.addFeaturedMovie(
                Long.parseLong(body.get("movieId").toString()),
                (String) body.get("title"),
                (String) body.get("posterPath"),
                (String) body.get("note")
        );
    }

    @DeleteMapping("/featured-movies/{movieId}")
    public void removeFeaturedMovie(@PathVariable long movieId) {
        adminService.removeFeaturedMovie(movieId);
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        return adminService.getAnalytics();
    }

    @GetMapping("/api-monitoring")
    public Map<String, Object> getApiMetrics() {
        return adminService.getApiMetrics();
    }
}
