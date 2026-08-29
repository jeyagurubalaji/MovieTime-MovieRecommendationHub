package com.movietime.repository;

import com.movietime.model.GamificationProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GamificationProfileRepository extends MongoRepository<GamificationProfile, String> {
    Optional<GamificationProfile> findByUserId(String userId);
    List<GamificationProfile> findTop50ByOrderByPointsDesc();
}
