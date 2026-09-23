package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/{movieId}/similar")
    public Mono<Object> similar(@PathVariable long movieId,
                                @RequestParam(defaultValue = "1") int page,
                                @RequestParam(defaultValue = "movie") String type) {
        return aiServiceClient.get("/recommendations/" + movieId + "/similar?page=" + page + "&type=" + type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/{movieId}/same-director")
    public Mono<Object> sameDirector(@PathVariable long movieId,
                                     @RequestParam(defaultValue = "1") int page,
                                     @RequestParam(defaultValue = "movie") String type) {
        return aiServiceClient.get("/recommendations/" + movieId + "/same-director?page=" + page + "&type=" + type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/{movieId}/same-actor")
    public Mono<Object> sameActor(@PathVariable long movieId,
                                  @RequestParam(defaultValue = "1") int page,
                                  @RequestParam(defaultValue = "movie") String type) {
        return aiServiceClient.get("/recommendations/" + movieId + "/same-actor?page=" + page + "&type=" + type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/{movieId}/same-genre")
    public Mono<Object> sameGenre(@PathVariable long movieId,
                                  @RequestParam(defaultValue = "1") int page,
                                  @RequestParam(defaultValue = "movie") String type) {
        return aiServiceClient.get("/recommendations/" + movieId + "/same-genre?page=" + page + "&type=" + type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/{movieId}/because-you-watched")
    public Mono<Object> becauseYouWatched(@PathVariable long movieId,
                                          @RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "movie") String type) {
        return aiServiceClient.get("/recommendations/" + movieId + "/because-you-watched?page=" + page + "&type=" + type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @PostMapping("/personalized")
    public Mono<Object> personalized(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/recommendations/personalized", body)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/trending-in/{region}")
    public Mono<Object> trendingIn(@PathVariable String region, @RequestParam(defaultValue = "1") int page) {
        return aiServiceClient.get("/recommendations/trending-in/" + region + "?page=" + page)
                .map(node -> mapper.convertValue(node, Object.class));
    }
}