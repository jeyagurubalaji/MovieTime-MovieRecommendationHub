package com.movietime.service;

import com.movietime.config.ApiMetricsFilter;
import com.movietime.model.FeaturedMovie;
import com.movietime.model.LibraryItem;
import com.movietime.model.Review;
import com.movietime.model.User;
import com.movietime.repository.FeaturedMovieRepository;
import com.movietime.repository.LibraryItemRepository;
import com.movietime.repository.ReviewRepository;
import com.movietime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final LibraryItemRepository libraryItemRepository;
    private final FeaturedMovieRepository featuredMovieRepository;
    private final ApiMetricsFilter apiMetricsFilter;

    public List<User> getUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size)).getContent();
    }

    public User setAdminRole(String userId, boolean isAdmin) {
        User user = userRepository.findById(userId).orElseThrow();
        if (isAdmin) {
            user.getRoles().add(User.Role.ADMIN);
        } else {
            user.getRoles().remove(User.Role.ADMIN);
        }
        return userRepository.save(user);
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    public List<Review> getReviewsForModeration(boolean onlyReported) {
        List<Review> all = reviewRepository.findAll();
        if (onlyReported) {
            return all.stream()
                    .filter(r -> !r.getReportedByUserIds().isEmpty())
                    .sorted(Comparator.comparingInt((Review r) -> r.getReportedByUserIds().size()).reversed())
                    .toList();
        }
        return all.stream().sorted(Comparator.comparing(Review::getCreatedAt).reversed()).toList();
    }

    public void setReviewHidden(String reviewId, boolean hidden) {
        reviewRepository.findById(reviewId).ifPresent(r -> {
            r.setHidden(hidden);
            reviewRepository.save(r);
        });
    }

    public void deleteReview(String reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    public List<FeaturedMovie> getFeaturedMovies() {
        return featuredMovieRepository.findAllByOrderByAddedAtDesc();
    }

    public FeaturedMovie addFeaturedMovie(long movieId, String title, String posterPath, String note) {
        if (featuredMovieRepository.existsByMovieId(movieId)) {
            featuredMovieRepository.deleteByMovieId(movieId);
        }
        return featuredMovieRepository.save(FeaturedMovie.builder()
                .movieId(movieId)
                .title(title)
                .posterPath(posterPath)
                .note(note)
                .addedAt(Instant.now())
                .build());
    }

    public void removeFeaturedMovie(long movieId) {
        featuredMovieRepository.deleteByMovieId(movieId);
    }

    public Map<String, Object> getAnalytics() {
        long totalUsers = userRepository.count();
        long totalReviews = reviewRepository.count();
        long totalWatched = libraryItemRepository.countByType(LibraryItem.LibraryType.WATCHED);
        long totalFavorites = libraryItemRepository.countByType(LibraryItem.LibraryType.FAVORITE);

        Map<String, Long> signupsByDay = new LinkedHashMap<>();
        for (User u : userRepository.findAll()) {
            if (u.getCreatedAt() == null) continue;
            String day = DAY_FORMAT.format(u.getCreatedAt().atZone(ZoneOffset.UTC));
            signupsByDay.merge(day, 1L, Long::sum);
        }

        Map<String, Long> genreCounts = new LinkedHashMap<>();
        for (LibraryItem item : libraryItemRepository.findByType(LibraryItem.LibraryType.WATCHED)) {
            if (item.getGenreNames() == null) continue;
            item.getGenreNames().forEach(g -> genreCounts.merge(g, 1L, Long::sum));
        }
        List<Map.Entry<String, Long>> topGenres = genreCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .toList();

        Map<Long, Long> reviewCountByMovie = new LinkedHashMap<>();
        for (Review r : reviewRepository.findAll()) {
            reviewCountByMovie.merge(r.getMovieId(), 1L, Long::sum);
        }
        List<Map.Entry<Long, Long>> mostReviewedMovies = reviewCountByMovie.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .toList();

        return Map.of(
                "totalUsers", totalUsers,
                "totalReviews", totalReviews,
                "totalWatched", totalWatched,
                "totalFavorites", totalFavorites,
                "signupsByDay", signupsByDay,
                "topGenresPlatformWide", topGenres,
                "mostReviewedMovieIds", mostReviewedMovies
        );
    }

    public Map<String, Object> getApiMetrics() {
        return apiMetricsFilter.snapshot();
    }
}
