package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quiz_sessions")
public class QuizSession {

    @Id
    private String id;

    private String userId;
    private QuizType type;
    private List<Question> questions;
    private Instant createdAt;

    public enum QuizType {
        TRIVIA, GUESS_THE_MOVIE
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String id;
        private String prompt;
        private String imageUrl; // used for guess-the-movie (poster)
        private List<Option> options;
        private String correctOptionId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Option {
        private String id;
        private String text;
    }
}
