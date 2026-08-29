package com.movietime.repository;

import com.movietime.model.QuizSession;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface QuizSessionRepository extends MongoRepository<QuizSession, String> {
    Optional<QuizSession> findByIdAndUserId(String id, String userId);
}
