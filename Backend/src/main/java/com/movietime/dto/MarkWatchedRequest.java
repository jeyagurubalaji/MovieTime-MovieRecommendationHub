package com.movietime.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MarkWatchedRequest {
    @NotNull
    private Long movieId;
    private String title;
    private String posterPath;
    private String releaseDate;
    private Double voteAverage;
    private Double personalRating;
}
