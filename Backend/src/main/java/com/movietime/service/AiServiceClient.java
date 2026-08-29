package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Thin proxy to the Python FastAPI AI microservice, so the frontend only ever
 * talks to the Spring backend (keeping JWT auth and CORS in one place).
 */
@Service
public class AiServiceClient {

    private final WebClient webClient;

    public AiServiceClient(@Value("${ai.service.base-url}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    public Mono<JsonNode> get(String path) {
        return webClient.get()
                .uri(path)
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> post(String path, Object body) {
        return webClient.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}
