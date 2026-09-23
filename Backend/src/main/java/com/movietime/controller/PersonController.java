package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movietime.service.TmdbService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/people")
@RequiredArgsConstructor
public class PersonController {

    private final TmdbService tmdbService;
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/{id}")
    public Mono<Object> details(@PathVariable long id) {
        return tmdbService.getPersonDetails(id)
                .map(node -> mapper.convertValue(node, Object.class));
    }
}