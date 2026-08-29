package com.movietime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private long moviesWatched;
    private String favoriteGenre;
    private String favoriteActor;
    private String favoriteDirector;
    private Double averageRatingGiven;
    private Map<String, Long> monthlyWatchCounts; // "2026-08" -> count, last 12 months
    private List<GenreCount> topGenres;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenreCount {
        private String genre;
        private long count;
    }
}
