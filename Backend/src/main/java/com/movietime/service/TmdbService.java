package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class TmdbService {

    private final WebClient webClient;

    @Value("${tmdb.api-key}")
    private String apiKey;

    public TmdbService(@Value("${tmdb.base-url}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    public Mono<JsonNode> getTrending(String timeWindow, int page) {
        return get("/trending/movie/" + timeWindow, page);
    }

    public Mono<JsonNode> getPopular(int page) {
        return get("/movie/popular", page);
    }

    public Mono<JsonNode> getNowPlaying(int page) {
        return get("/movie/now_playing", page);
    }

    public Mono<JsonNode> getUpcoming(int page) {
        return get("/movie/upcoming", page);
    }

    public Mono<JsonNode> getTopRated(int page) {
        return get("/movie/top_rated", page);
    }

    public Mono<JsonNode> getMovieDetails(long movieId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId)
                        .queryParam("api_key", apiKey)
                        .queryParam("append_to_response", "credits,videos,similar,recommendations")
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> searchMovies(String query, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> searchPeople(String query, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/person")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> discoverByGenre(int genreId, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_genres", genreId)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /** Upcoming/recent movies featuring a given cast member - used to detect "favorite actor's new movie". */
    public Mono<JsonNode> discoverByCast(long personId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_cast", personId)
                        .queryParam("sort_by", "primary_release_date.desc")
                        .queryParam("primary_release_date.lte",
                                java.time.LocalDate.now().plusMonths(6).toString())
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /**
     * General-purpose discover with the full Phase 2 filter set:
     * genre, release year, language, minimum rating, runtime range, country, sort order.
     * Any parameter left null is simply omitted from the TMDB query.
     */
    public Mono<JsonNode> discoverMovies(Integer genreId, Integer year, String language,
                                          Double minRating, Integer minRuntime, Integer maxRuntime,
                                          String country, String sortBy, int page) {
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/discover/movie")
                            .queryParam("api_key", apiKey)
                            .queryParam("page", page)
                            .queryParam("sort_by", sortBy != null ? sortBy : "popularity.desc");

                    if (genreId != null) uriBuilder.queryParam("with_genres", genreId);
                    if (year != null) uriBuilder.queryParam("primary_release_year", year);
                    if (language != null) uriBuilder.queryParam("with_original_language", language);
                    if (minRating != null) uriBuilder.queryParam("vote_average.gte", minRating);
                    if (minRuntime != null) uriBuilder.queryParam("with_runtime.gte", minRuntime);
                    if (maxRuntime != null) uriBuilder.queryParam("with_runtime.lte", maxRuntime);
                    if (country != null) uriBuilder.queryParam("with_origin_country", country);

                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> getCredits(long movieId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/credits")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> getPersonDetails(long personId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/person/" + personId)
                        .queryParam("api_key", apiKey)
                        .queryParam("append_to_response", "movie_credits")
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> getGenres() {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/genre/movie/list")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> searchKeyword(String query) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/keyword")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> discoverByKeyword(long keywordId, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_keywords", keywordId)
                        .queryParam("sort_by", "popularity.desc")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> discoverByCountry(String countryCode, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_origin_country", countryCode)
                        .queryParam("sort_by", "popularity.desc")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> discoverFamilyFriendly(int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("certification_country", "US")
                        .queryParam("certification.lte", "PG")
                        .queryParam("with_genres", "10751,16")
                        .queryParam("sort_by", "popularity.desc")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> discoverByDateRange(String fromDate, String toDate, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("primary_release_date.gte", fromDate)
                        .queryParam("primary_release_date.lte", toDate)
                        .queryParam("sort_by", "primary_release_date.asc")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /** Looks up a TMDB keyword id by text (e.g. "christmas") for use with discoverByKeyword. */
    public Mono<JsonNode> searchKeyword(String query) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/keyword")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> discoverByKeywordAndGenre(Long keywordId, Integer genreId, int page) {
        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/discover/movie")
                            .queryParam("api_key", apiKey)
                            .queryParam("sort_by", "popularity.desc")
                            .queryParam("page", page);
                    if (keywordId != null) uriBuilder.queryParam("with_keywords", keywordId);
                    if (genreId != null) uriBuilder.queryParam("with_genres", genreId);
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /** Movies releasing within a date range - powers the release calendar. */
    public Mono<JsonNode> discoverByDateRange(String fromDate, String toDate, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("primary_release_date.gte", fromDate)
                        .queryParam("primary_release_date.lte", toDate)
                        .queryParam("sort_by", "primary_release_date.asc")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /** Family-friendly discover - genre + a lenient US certification ceiling. */
    public Mono<JsonNode> discoverFamilyFriendly(int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_genres", 10751)
                        .queryParam("certification_country", "US")
                        .queryParam("certification.lte", "PG")
                        .queryParam("sort_by", "popularity.desc")
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    private Mono<JsonNode> get(String path, int page) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(path)
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}
