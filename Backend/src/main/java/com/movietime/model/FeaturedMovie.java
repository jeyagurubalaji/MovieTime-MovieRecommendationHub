package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "featured_movies")
public class FeaturedMovie {

    @Id
    private String id;

    @Indexed(unique = true)
    private long movieId;

    private String title;
    private String posterPath;
    private String note;
    private Instant addedAt;
}
