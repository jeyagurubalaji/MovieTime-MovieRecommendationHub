package com.movietime.repository;

import com.movietime.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByPasswordResetToken(String token);

    boolean existsByEmail(String email);
}
