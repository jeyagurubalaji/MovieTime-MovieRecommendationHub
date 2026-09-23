package com.movietime.service;

import com.movietime.dto.StatsResponse;
import com.movietime.model.LibraryItem;
import com.movietime.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final LibraryItemRepository libraryItemRepository;

    public StatsResponse getStatsForUser(String userId) {
        List<LibraryItem> watched = libraryItemRepository
                .findByUserIdAndTypeOrderByAddedAtDesc(userId, LibraryItem.LibraryType.WATCHED);

        long moviesWatched = watched.size();

        Map<String, Long> genreCounts = new LinkedHashMap<>();
        Map<String, Long> actorCounts = new LinkedHashMap<>();
        Map<String, Long> directorCounts = new LinkedHashMap<>();

        for (LibraryItem item : watched) {
            if (item.getGenreNames() != null) {
                item.getGenreNames().forEach(g -> genreCounts.merge(g, 1L, Long::sum));
            }
            if (item.getTopCastNames() != null) {
                item.getTopCastNames().forEach(a -> actorCounts.merge(a, 1L, Long::sum));
            }
            if (item.getDirectorName() != null) {
                directorCounts.merge(item.getDirectorName(), 1L, Long::sum);
            }
        }

        String favoriteGenre = topEntry(genreCounts);
        String favoriteActor = topEntry(actorCounts);
        String favoriteDirector = topEntry(directorCounts);

        List<Double> ratings = watched.stream()
                .map(LibraryItem::getPersonalRating)
                .filter(Objects::nonNull)
                .toList();
        Double avgRating = ratings.isEmpty() ? null
                : Math.round(ratings.stream().mapToDouble(Double::doubleValue).average().orElse(0) * 10.0) / 10.0;

        Map<String, Long> monthlyCounts = new LinkedHashMap<>();
        for (LibraryItem item : watched) {
            if (item.getAddedAt() == null) continue;
            String month = MONTH_FORMAT.format(item.getAddedAt().atZone(ZoneOffset.UTC));
            monthlyCounts.merge(month, 1L, Long::sum);
        }

        List<StatsResponse.GenreCount> topGenres = genreCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> StatsResponse.GenreCount.builder().genre(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        return StatsResponse.builder()
                .moviesWatched(moviesWatched)
                .favoriteGenre(favoriteGenre)
                .favoriteActor(favoriteActor)
                .favoriteDirector(favoriteDirector)
                .averageRatingGiven(avgRating)
                .monthlyWatchCounts(monthlyCounts)
                .topGenres(topGenres)
                .build();
    }

    private String topEntry(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }
}
