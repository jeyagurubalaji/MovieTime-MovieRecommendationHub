package com.movietime.repository;

import com.movietime.model.FollowedActor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FollowedActorRepository extends MongoRepository<FollowedActor, String> {
    List<FollowedActor> findByUserId(String userId);
    Optional<FollowedActor> findByUserIdAndPersonId(String userId, long personId);
    List<FollowedActor> findAll();
}
