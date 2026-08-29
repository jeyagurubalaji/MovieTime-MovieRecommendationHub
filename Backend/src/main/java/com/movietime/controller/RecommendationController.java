package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.service.AiServiceClient;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final AiServiceClient aiServiceClient;

    @GetMapping("/{movieId}/similar")
    public Mono<JsonNode> similar(@PathVariable long movieId, @RequestParam(defaultValue = "1") int page) {
        return aiServiceClient.get("/recommendations/" + movieId + "/similar?page=" + page);
    }

    @GetMapping("/{movieId}/same-director")
    public Mono<JsonNode> sameDirector(@PathVariable long movieId, @RequestParam(defaultValue = "1") int page) {
        return aiServiceClient.get("/recommendations/" + movieId + "/same-director?page=" + page);
    }

    @GetMapping("/{movieId}/same-actor")
    public Mono<JsonNode> sameActor(@PathVariable long movieId, @RequestParam(defaultValue = "1") int page) {
        return aiServiceClient.get("/recommendations/" + movieId + "/same-actor?page=" + page);
    }

    @GetMapping("/{movieId}/same-genre")
    public Mono<JsonNode> sameGenre(@PathVariable long movieId, @RequestParam(defaultValue = "1") int page) {
        return aiServiceClient.get("/recommendations/" + movieId + "/same-genre?page=" + page);
    }

    @GetMapping("/{movieId}/because-you-watched")
    public Mono<JsonNode> becauseYouWatched(@PathVariable long movieId, @RequestParam(defaultValue = "1") int page) {
        return aiServiceClient.get("/recommendations/" + movieId + "/because-you-watched?page=" + page);
    }

    @PostMapping("/personalized")
    public Mono<JsonNode> personalized(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/recommendations/personalized", body);
    }

    @GetMapping("/trending-in/{region}")
    public Mono<JsonNode> trendingIn(@PathVariable String region, @RequestParam(defaultValue = "1") int page) {
        return aiServiceClient.get("/recommendations/trending-in/" + region + "?page=" + page);
    }
}
