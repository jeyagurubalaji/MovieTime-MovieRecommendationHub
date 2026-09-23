package com.movietime.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewRequest {

    private long movieId;

    @DecimalMin(value = "0.5", message = "Rating must be at least 0.5")
    @DecimalMax(value = "10", message = "Rating cannot exceed 10")
    private double rating;

    @NotBlank(message = "Review text is required")
    private String text;

    private boolean spoiler;
}
