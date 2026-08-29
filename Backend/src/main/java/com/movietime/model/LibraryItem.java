package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "library_items")
@CompoundIndexes({
        @CompoundIndex(name = "user_movie_type", def = "{'userId': 1, 'movieId': 1, 'type': 1}", unique = true),
        @CompoundIndex(name = "user_type", def = "{'userId': 1, 'type': 1}")
})
public class LibraryItem {

    @Id
    private String id;

    private String userId;
    private long movieId;

    private LibraryType type;

    // --- Movie snapshot (avoids re-fetching TMDB for every list render) ---
    private String title;
    private String posterPath;
    private String releaseDate;
    private Double voteAverage;

    // --- Enrichment, populated when marking WATCHED (used by the stats dashboard) ---
    private List<String> genreNames;
    private String directorName;
    private List<String> topCastNames;

    // --- Type-specific fields ---
    private Double personalRating;       // WATCHED
    private Integer progressMinutes;     // CONTINUE_WATCHING
    private Integer totalRuntimeMinutes; // CONTINUE_WATCHING

    private Instant addedAt;
    private Instant updatedAt;

    public enum LibraryType {
        FAVORITE, WATCHLIST, WATCHED, HIDDEN, RECENTLY_VIEWED, CONTINUE_WATCHING
    }
}
