package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movietime.service.AiServiceClient;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiServiceClient aiServiceClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/search-by-description")
    public Mono<Object> searchByDescription(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/search-by-description", body)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @PostMapping("/mood")
    public Mono<Object> mood(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/mood", body)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @PostMapping("/chat")
    public Mono<Object> chat(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/chat", body)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @PostMapping("/what-to-watch-tonight")
    public Mono<Object> whatToWatchTonight(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/what-to-watch-tonight", body)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @GetMapping("/summarize/{movieId}")
    public Mono<Object> summarize(@PathVariable long movieId, @RequestParam(defaultValue = "movie") String type) {
        // Appends the type parameter to the microservice path
        return aiServiceClient.get("/ai/summarize/" + movieId + "?type=" + type)
                .map(node -> mapper.convertValue(node, Object.class));
    }

    @PostMapping("/spoiler-free-summary")
    public Mono<Object> spoilerFreeSummary(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/spoiler-free-summary", body)
                .map(node -> mapper.convertValue(node, Object.class));
    }
}