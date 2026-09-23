package com.movietime.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyRequest {

    @NotBlank(message = "Reply text is required")
    private String text;
}
