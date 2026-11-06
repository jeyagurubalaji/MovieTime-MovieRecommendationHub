package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDate;

@Service
@Slf4j
public class TmdbService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${tmdb.api-key}")
    private String apiKey;

    public TmdbService(@Value("${tmdb.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", "MovieTime/1.0 (Spring Boot)")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.error("Error parsing TMDB JSON response", e);
            return objectMapper.createObjectNode();
        }
    }

    private Mono<JsonNode> fallback(Throwable e) {
        log.error("TMDB Network Error after retries: {}", e.getMessage());
        return Mono.just(objectMapper.createObjectNode());
    }

    private Mono<JsonNode> executeWithRetry(WebClient.ResponseSpec responseSpec) {
        return responseSpec
                .bodyToMono(String.class)
                .map(this::parseJson)
                .retryWhen(Retry.backoff(3, Duration.ofMillis(500)))
                .onErrorResume(this::fallback);
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

    public Mono<JsonNode> getMovieDetails(long movieId, String type) {
        String endpoint = (type != null && type.equals("tv")) ? "/tv/" : "/movie/";
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(endpoint + movieId)
                        .queryParam("api_key", apiKey)
                        .queryParam("append_to_response", "credits,videos,similar,recommendations")
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> getWatchProviders(long movieId, String type) {
        String endpoint = (type != null && type.equals("tv")) ? "/tv/" : "/movie/";
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(endpoint + movieId + "/watch/providers")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> searchMovies(String query, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/multi")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> searchPeople(String query, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/person")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverByGenre(int genreId, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_genres", genreId)
                        .queryParam("sort_by", "primary_release_date.desc") // Prioritize Newest
                        .queryParam("primary_release_date.lte", LocalDate.now().toString()) // Prevents unreleased
                        .queryParam("vote_count.gte", 10) // Prevents empty obscure junk
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverByCast(long personId) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_cast", personId)
                        .queryParam("sort_by", "primary_release_date.desc")
                        .queryParam("primary_release_date.lte", LocalDate.now().toString())
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverMovies(Integer genreId, Integer year, String language,
                                         Double minRating, Integer minRuntime, Integer maxRuntime,
                                         String country, String sortBy, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/discover/movie")
                            .queryParam("api_key", apiKey)
                            .queryParam("page", page)
                            // Override default popularity.desc to primary_release_date.desc
                            .queryParam("sort_by", sortBy != null ? sortBy : "primary_release_date.desc")
                            .queryParam("primary_release_date.lte", LocalDate.now().toString())
                            .queryParam("vote_count.gte", 10);

                    if (genreId != null) uriBuilder.queryParam("with_genres", genreId);
                    if (year != null) uriBuilder.queryParam("primary_release_year", year);
                    if (language != null) uriBuilder.queryParam("with_original_language", language);
                    if (minRating != null) uriBuilder.queryParam("vote_average.gte", minRating);
                    if (minRuntime != null) uriBuilder.queryParam("with_runtime.gte", minRuntime);
                    if (maxRuntime != null) uriBuilder.queryParam("with_runtime.lte", maxRuntime);
                    if (country != null) uriBuilder.queryParam("with_origin_country", country);

                    return uriBuilder.build();
                })
                .retrieve());
    }

    public Mono<JsonNode> getCredits(long movieId) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/movie/" + movieId + "/credits")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> getPersonDetails(long personId) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/person/" + personId)
                        .queryParam("api_key", apiKey)
                        .queryParam("append_to_response", "combined_credits")
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> getGenres() {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/genre/movie/list")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> searchKeyword(String query) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/keyword")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverByKeyword(long keywordId, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_keywords", keywordId)
                        .queryParam("sort_by", "primary_release_date.desc")
                        .queryParam("primary_release_date.lte", LocalDate.now().toString())
                        .queryParam("vote_count.gte", 10)
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverByCountry(String countryCode, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("with_origin_country", countryCode)
                        .queryParam("sort_by", "primary_release_date.desc")
                        .queryParam("primary_release_date.lte", LocalDate.now().toString())
                        .queryParam("vote_count.gte", 10)
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverFamilyFriendly(int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("certification_country", "US")
                        .queryParam("certification.lte", "PG")
                        .queryParam("with_genres", "10751,16")
                        .queryParam("sort_by", "primary_release_date.desc")
                        .queryParam("primary_release_date.lte", LocalDate.now().toString())
                        .queryParam("vote_count.gte", 10)
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverByDateRange(String fromDate, String toDate, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/discover/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("primary_release_date.gte", fromDate)
                        .queryParam("primary_release_date.lte", toDate)
                        .queryParam("sort_by", "primary_release_date.desc")
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }

    public Mono<JsonNode> discoverByKeywordAndGenre(Long keywordId, Integer genreId, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/discover/movie")
                            .queryParam("api_key", apiKey)
                            .queryParam("sort_by", "primary_release_date.desc")
                            .queryParam("primary_release_date.lte", LocalDate.now().toString())
                            .queryParam("vote_count.gte", 10)
                            .queryParam("page", page);
                    if (keywordId != null) uriBuilder.queryParam("with_keywords", keywordId);
                    if (genreId != null) uriBuilder.queryParam("with_genres", genreId);
                    return uriBuilder.build();
                })
                .retrieve());
    }

    private Mono<JsonNode> get(String path, int page) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(path)
                        .queryParam("api_key", apiKey)
                        .queryParam("page", page)
                        .build())
                .retrieve());
    }
    public Mono<JsonNode> getListDetails(String listId) {
        return executeWithRetry(webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/list/" + listId)
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve());
    }
}