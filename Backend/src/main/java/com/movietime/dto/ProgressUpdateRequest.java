package com.movietime.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProgressUpdateRequest {
    @NotNull
    private Long movieId;
    private String title;
    private String posterPath;
    private Integer progressMinutes;
    private Integer totalRuntimeMinutes;
}
