package com.movietime.dto;

import com.movietime.model.LibraryItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryItemResponse {
    private String id;
    private long movieId;
    private String title;
    private String posterPath;
    private String releaseDate;
    private Double voteAverage;
    private LibraryItem.LibraryType type;
    private Double personalRating;
    private Integer progressMinutes;
    private Integer totalRuntimeMinutes;
    private Instant addedAt;

    public static LibraryItemResponse fromEntity(LibraryItem item) {
        return LibraryItemResponse.builder()
                .id(item.getId())
                .movieId(item.getMovieId())
                .title(item.getTitle())
                .posterPath(item.getPosterPath())
                .releaseDate(item.getReleaseDate())
                .voteAverage(item.getVoteAverage())
                .type(item.getType())
                .personalRating(item.getPersonalRating())
                .progressMinutes(item.getProgressMinutes())
                .totalRuntimeMinutes(item.getTotalRuntimeMinutes())
                .addedAt(item.getAddedAt())
                .build();
    }
}
