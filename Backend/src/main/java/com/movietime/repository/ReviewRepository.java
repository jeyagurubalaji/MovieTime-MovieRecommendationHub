package com.movietime.repository;

import com.movietime.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByMovieIdAndHiddenFalseOrderByCreatedAtDesc(long movieId);

    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Review> findByReportedByUserIdsNotEmptyAndHiddenFalse();
}
