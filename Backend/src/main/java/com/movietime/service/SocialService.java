package com.movietime.service;

import com.movietime.dto.PublicProfileResponse;
import com.movietime.dto.TopReviewerResponse;
import com.movietime.dto.TrendingReviewResponse;
import com.movietime.exception.ApiException;
import com.movietime.model.Follow;
import com.movietime.model.LibraryItem;
import com.movietime.model.Review;
import com.movietime.model.User;
import com.movietime.repository.FollowRepository;
import com.movietime.repository.LibraryItemRepository;
import com.movietime.repository.ReviewRepository;
import com.movietime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final LibraryItemRepository libraryItemRepository;
    private final GamificationService gamificationService;

    public void follow(String followerId, String followingId) {
        if (followerId.equals(followingId)) {
            throw new ApiException("You can't follow yourself", HttpStatus.BAD_REQUEST);
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }
        followRepository.save(Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .createdAt(Instant.now())
                .build());

        long totalFollowing = followRepository.countByFollowerId(followerId);
        gamificationService.onFollowedSomeone(followerId, totalFollowing);
    }

    public void unfollow(String followerId, String followingId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    public List<User> getFollowers(String userId) {
        List<String> followerIds = followRepository.findByFollowingId(userId).stream()
                .map(Follow::getFollowerId).toList();
        return userRepository.findAllById(followerIds);
    }

    public List<User> getFollowing(String userId) {
        List<String> followingIds = followRepository.findByFollowerId(userId).stream()
                .map(Follow::getFollowingId).toList();
        return userRepository.findAllById(followingIds);
    }

    public PublicProfileResponse getPublicProfile(String targetUserId, String requestingUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!target.isPublicProfile()) {
            throw new ApiException("This profile is private", HttpStatus.FORBIDDEN);
        }

        long followerCount = followRepository.countByFollowingId(targetUserId);
        long followingCount = followRepository.countByFollowerId(targetUserId);
        long reviewCount = reviewRepository.findByUserIdOrderByCreatedAtDesc(targetUserId).size();
        long watchedCount = libraryItemRepository.countByUserIdAndType(targetUserId, LibraryItem.LibraryType.WATCHED);

        boolean isFollowed = requestingUserId != null
                && followRepository.existsByFollowerIdAndFollowingId(requestingUserId, targetUserId);

        var gamificationProfile = gamificationService.getOrCreateProfile(targetUserId);

        return PublicProfileResponse.builder()
                .id(target.getId())
                .displayName(target.getDisplayName())
                .profilePictureUrl(target.getProfilePictureUrl())
                .bio(target.getBio())
                .memberSince(target.getCreatedAt())
                .followerCount(followerCount)
                .followingCount(followingCount)
                .reviewCount(reviewCount)
                .moviesWatchedCount(watchedCount)
                .isFollowedByCurrentUser(isFollowed)
                .watchlistPublic(target.isPublicWatchlist())
                .points(gamificationProfile.getPoints())
                .currentStreak(gamificationProfile.getCurrentStreak())
                .badges(gamificationProfile.getBadges())
                .build();
    }

    public List<LibraryItem> getPublicWatchlist(String targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        if (!target.isPublicWatchlist()) {
            throw new ApiException("This user's watchlist is private", HttpStatus.FORBIDDEN);
        }
        return libraryItemRepository.findByUserIdAndTypeOrderByAddedAtDesc(targetUserId, LibraryItem.LibraryType.WATCHLIST);
    }

    /** In-memory aggregation - fine at the review volume a portfolio project will see. */
    public List<TopReviewerResponse> getTopReviewers(int limit) {
        List<Review> allReviews = reviewRepository.findAll();

        Map<String, List<Review>> byUser = allReviews.stream()
                .collect(Collectors.groupingBy(Review::getUserId));

        return byUser.entrySet().stream()
                .map(e -> {
                    List<Review> reviews = e.getValue();
                    long likes = reviews.stream().mapToLong(r -> r.getLikedByUserIds().size()).sum();
                    Review any = reviews.get(0);
                    return TopReviewerResponse.builder()
                            .userId(e.getKey())
                            .displayName(any.getUserDisplayName())
                            .profilePictureUrl(any.getUserProfilePictureUrl())
                            .reviewCount(reviews.size())
                            .totalLikesReceived(likes)
                            .build();
                })
                .sorted(Comparator.comparingLong(TopReviewerResponse::getTotalLikesReceived)
                        .thenComparingLong(TopReviewerResponse::getReviewCount)
                        .reversed())
                .limit(limit)
                .toList();
    }

    public List<TrendingReviewResponse> getTrendingReviews(int limit) {
        return reviewRepository.findAll().stream()
                .filter(r -> !r.isHidden())
                .sorted(Comparator.comparingInt((Review r) -> r.getLikedByUserIds().size()).reversed()
                        .thenComparing(Review::getCreatedAt, Comparator.reverseOrder()))
                .limit(limit)
                .map(r -> TrendingReviewResponse.builder()
                        .id(r.getId())
                        .movieId(r.getMovieId())
                        .userId(r.getUserId())
                        .userDisplayName(r.getUserDisplayName())
                        .userProfilePictureUrl(r.getUserProfilePictureUrl())
                        .rating(r.getRating())
                        .text(r.getText())
                        .likeCount(r.getLikedByUserIds().size())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();
    }
}
