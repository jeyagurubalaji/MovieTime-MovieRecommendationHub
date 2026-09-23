package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movietime.service.TmdbService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final TmdbService tmdbService;
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/movies")
    public Mono<Object> searchMovies(@RequestParam String query, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.searchMovies(query, page)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/people")
    public Mono<Object> searchPeople(@RequestParam String query, @RequestParam(defaultValue = "1") int page) {
        return tmdbService.searchPeople(query, page)
                .map(node -> mapper.convertValue(node, Object.class));
    }
}