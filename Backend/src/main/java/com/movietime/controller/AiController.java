package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
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

    @PostMapping("/search-by-description")
    public Mono<JsonNode> searchByDescription(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/search-by-description", body);
    }

    @PostMapping("/mood")
    public Mono<JsonNode> mood(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/mood", body);
    }

    @PostMapping("/chat")
    public Mono<JsonNode> chat(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/chat", body);
    }

    @PostMapping("/what-to-watch-tonight")
    public Mono<JsonNode> whatToWatchTonight(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/what-to-watch-tonight", body);
    }

    @GetMapping("/summarize/{movieId}")
    public Mono<JsonNode> summarize(@PathVariable long movieId) {
        return aiServiceClient.get("/ai/summarize/" + movieId);
    }

    @PostMapping("/spoiler-free-summary")
    public Mono<JsonNode> spoilerFreeSummary(@RequestBody Map<String, Object> body) {
        return aiServiceClient.post("/ai/spoiler-free-summary", body);
    }
}
