package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.service.TmdbService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final TmdbService tmdbService;

    @GetMapping("/trending")
    public Mono<JsonNode> trending(@RequestParam(defaultValue = "week") String window,
                                    @RequestParam(defaultValue = "1") int page) {
        return tmdbService.getTrending(window, page);
    }

    @GetMapping("/popular")
    public Mono<JsonNode> popular(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getPopular(page);
    }

    @GetMapping("/now-playing")
    public Mono<JsonNode> nowPlaying(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getNowPlaying(page);
    }

    @GetMapping("/upcoming")
    public Mono<JsonNode> upcoming(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getUpcoming(page);
    }

    @GetMapping("/top-rated")
    public Mono<JsonNode> topRated(@RequestParam(defaultValue = "1") int page) {
        return tmdbService.getTopRated(page);
    }

    @GetMapping("/genres")
    public Mono<JsonNode> genres() {
        return tmdbService.getGenres();
    }

    @GetMapping("/{id}")
    public Mono<JsonNode> details(@PathVariable long id) {
        return tmdbService.getMovieDetails(id);
    }

    @GetMapping("/discover")
    public Mono<JsonNode> discoverByGenre(@RequestParam int genreId, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.discoverByGenre(genreId, page);
    }

    /** Full filter panel: release year, language, rating, runtime, genre, country, sort */
    @GetMapping("/filter")
    public Mono<JsonNode> filter(
            @RequestParam(required = false) Integer genreId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer minRuntime,
            @RequestParam(required = false) Integer maxRuntime,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "1") int page) {
        return tmdbService.discoverMovies(genreId, year, language, minRating, minRuntime, maxRuntime, country, sortBy, page);
    }

    @GetMapping("/{id}/credits")
    public Mono<JsonNode> credits(@PathVariable long id) {
        return tmdbService.getCredits(id);
    }
}
