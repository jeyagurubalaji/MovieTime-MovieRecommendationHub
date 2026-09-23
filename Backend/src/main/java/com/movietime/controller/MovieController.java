package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movietime.service.TmdbService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final TmdbService tmdbService;
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/trending")
    public Mono<Object> trending(@RequestParam(defaultValue = "week") String window,
                                 @RequestParam(defaultValue = "1") int page) {
        return tmdbService.getTrending(window, page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/popular")
    public Mono<Object> popular(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getPopular(page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/now-playing")
    public Mono<Object> nowPlaying(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getNowPlaying(page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/upcoming")
    public Mono<Object> upcoming(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getUpcoming(page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/top-rated")
    public Mono<Object> topRated(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getTopRated(page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/genres")
    public Mono<Object> genres() {
        return tmdbService.getGenres()
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/{id}")
    public Mono<Object> getMovieDetails(@PathVariable long id, @RequestParam(defaultValue = "movie") String type) {
        return tmdbService.getMovieDetails(id, type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    // NEW: Added endpoint for watch providers to stop the 500 Error
    @GetMapping("/{id}/watch/providers")
    public Mono<Object> getWatchProviders(@PathVariable long id, @RequestParam(defaultValue = "movie") String type) {
        return tmdbService.getWatchProviders(id, type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/discover")
    public Mono<Object> discoverByGenre(@RequestParam int genreId, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.discoverByGenre(genreId, page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/filter")
    public Mono<Object> filter(
            @RequestParam(required = false) Integer genreId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer minRuntime,
            @RequestParam(required = false) Integer maxRuntime,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "1") int page) {
        return tmdbService.discoverMovies(genreId, year, language, minRating, minRuntime, maxRuntime, country, sortBy, page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/{id}/credits")
    public Mono<Object> credits(@PathVariable long id) {
        return tmdbService.getCredits(id)
                .map(node -> mapper.convertValue(node, Object.class));
    }
}