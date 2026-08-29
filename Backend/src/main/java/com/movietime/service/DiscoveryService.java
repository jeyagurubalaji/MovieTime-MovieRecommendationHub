package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.core.OscarWinners;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final TmdbService tmdbService;
    private final com.movietime.repository.FeaturedMovieRepository featuredMovieRepository;

    /** Same pick for everyone on a given day - seeded off the date rather than random per-request. */
    public JsonNode getDailyPick() {
        JsonNode popular = tmdbService.getPopular(1).block();
        if (popular == null) return null;

        List<JsonNode> results = StreamSupport.stream(popular.path("results").spliterator(), false).toList();
        if (results.isEmpty()) return null;

        long daysSinceEpoch = LocalDate.now().toEpochDay();
        int index = (int) (daysSinceEpoch % results.size());
        return results.get(index);
    }

    public JsonNode getRandomMovie() {
        Random random = new Random();
        int page = random.nextInt(20) + 1; // TMDB popular has many pages; keep it to reasonably relevant ones
        JsonNode popular = tmdbService.getPopular(page).block();
        if (popular == null) return null;

        List<JsonNode> results = StreamSupport.stream(popular.path("results").spliterator(), false).toList();
        if (results.isEmpty()) return null;

        return results.get(random.nextInt(results.size()));
    }

    public List<JsonNode> getReleaseCalendar(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        String from = ym.atDay(1).toString();
        String to = ym.atEndOfMonth().toString();

        List<JsonNode> all = new ArrayList<>();
        for (int page = 1; page <= 3; page++) {
            JsonNode data = tmdbService.discoverByDateRange(from, to, page).block();
            if (data == null) break;
            List<JsonNode> pageResults = StreamSupport.stream(data.path("results").spliterator(), false).toList();
            all.addAll(pageResults);
            int totalPages = data.path("total_pages").asInt(1);
            if (page >= totalPages) break;
        }
        return all;
    }

    /** Looks each Best Picture winner up by title+year on TMDB rather than trusting hardcoded ids. */
    public List<JsonNode> getOscarWinners(int limit) {
        List<JsonNode> results = new ArrayList<>();
        for (Map.Entry<String, Integer> winner : OscarWinners.BEST_PICTURE_WINNERS) {
            if (results.size() >= limit) break;
            try {
                JsonNode searchResult = tmdbService.searchMovies(winner.getKey(), 1).block();
                if (searchResult == null) continue;

                StreamSupport.stream(searchResult.path("results").spliterator(), false)
                        .filter(m -> {
                            String releaseDate = m.path("release_date").asText("");
                            return releaseDate.startsWith(String.valueOf(winner.getValue()))
                                    || releaseDate.startsWith(String.valueOf(winner.getValue() + 1));
                        })
                        .findFirst()
                        .ifPresent(results::add);
            } catch (Exception ignored) {
                // Skip a title on TMDB hiccup rather than failing the whole list
            }
        }
        return results;
    }

    public List<JsonNode> getMoviesByCountry(String countryCode, int page) {
        JsonNode data = tmdbService.discoverByCountry(countryCode, page).block();
        return data == null ? List.of() : StreamSupport.stream(data.path("results").spliterator(), false).toList();
    }

    public List<JsonNode> getHolidayCollection(String holiday, int page) {
        String keyword = switch (holiday.toLowerCase()) {
            case "christmas", "holiday" -> "christmas";
            case "halloween" -> "halloween";
            case "valentine", "valentines" -> "valentine's day";
            default -> holiday;
        };

        JsonNode keywordSearch = tmdbService.searchKeyword(keyword).block();
        if (keywordSearch == null) return List.of();

        JsonNode firstMatch = keywordSearch.path("results").isEmpty() ? null : keywordSearch.path("results").get(0);
        if (firstMatch == null) return List.of();

        long keywordId = firstMatch.path("id").asLong();
        JsonNode data = tmdbService.discoverByKeyword(keywordId, page).block();
        return data == null ? List.of() : StreamSupport.stream(data.path("results").spliterator(), false).toList();
    }

    public List<JsonNode> getFamilyFriendly(int page) {
        JsonNode data = tmdbService.discoverFamilyFriendly(page).block();
        return data == null ? List.of() : StreamSupport.stream(data.path("results").spliterator(), false).toList();
    }

    public List<com.movietime.model.FeaturedMovie> getFeaturedMovies() {
        return featuredMovieRepository.findAllByOrderByAddedAtDesc();
    }
}
