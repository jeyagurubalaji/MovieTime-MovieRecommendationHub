package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.service.TmdbService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/people")
@RequiredArgsConstructor
public class PersonController {

    private final TmdbService tmdbService;

    @GetMapping("/{id}")
    public Mono<JsonNode> details(@PathVariable long id) {
        return tmdbService.getPersonDetails(id);
    }
}
