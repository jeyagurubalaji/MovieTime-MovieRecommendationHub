package com.movietime.repository;

import com.movietime.model.FeaturedMovie;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FeaturedMovieRepository extends MongoRepository<FeaturedMovie, String> {
    List<FeaturedMovie> findAllByOrderByAddedAtDesc();
    void deleteByMovieId(long movieId);
    boolean existsByMovieId(long movieId);
}
