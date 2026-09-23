package com.movietime.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    /** ID token issued by Google Sign-In on the frontend */
    @NotBlank(message = "Google ID token is required")
    private String idToken;
}
