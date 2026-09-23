package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class AiServiceClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiServiceClient(@Value("${ai.service.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
    }

    private JsonNode parseJson(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
            return objectMapper.createObjectNode();
        }
    }

    public Mono<JsonNode> post(String path, Object body) {
        return webClient.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseJson)
                .onErrorResume(e -> {
                    log.error("AI service communication error: {}", e.getMessage());
                    return Mono.just(objectMapper.createObjectNode());
                });
    }

    public Mono<JsonNode> get(String path) {
        return webClient.get()
                .uri(path)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseJson)
                .onErrorResume(e -> {
                    log.error("AI service communication error: {}", e.getMessage());
                    return Mono.just(objectMapper.createObjectNode());
                });
    }
}