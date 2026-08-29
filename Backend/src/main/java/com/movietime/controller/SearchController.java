package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.service.TmdbService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final TmdbService tmdbService;

    @GetMapping("/movies")
    public Mono<JsonNode> searchMovies(@RequestParam String query, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.searchMovies(query, page);
    }

    @GetMapping("/people")
    public Mono<JsonNode> searchPeople(@RequestParam String query, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.searchPeople(query, page);
    }
}
