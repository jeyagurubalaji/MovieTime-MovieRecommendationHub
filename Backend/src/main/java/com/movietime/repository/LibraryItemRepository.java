package com.movietime.repository;

import com.movietime.model.LibraryItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LibraryItemRepository extends MongoRepository<LibraryItem, String> {

    List<LibraryItem> findByUserIdAndTypeOrderByAddedAtDesc(String userId, LibraryItem.LibraryType type);

    Optional<LibraryItem> findByUserIdAndMovieIdAndType(String userId, long movieId, LibraryItem.LibraryType type);

    boolean existsByUserIdAndMovieIdAndType(String userId, long movieId, LibraryItem.LibraryType type);

    void deleteByUserIdAndMovieIdAndType(String userId, long movieId, LibraryItem.LibraryType type);

    long countByUserIdAndType(String userId, LibraryItem.LibraryType type);

    List<LibraryItem> findByUserIdAndTypeOrderByPersonalRatingDesc(String userId, LibraryItem.LibraryType type);

    List<LibraryItem> findByType(LibraryItem.LibraryType type);

    long countByType(LibraryItem.LibraryType type);
}
