package com.movietime.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "followed_actors")
@CompoundIndex(name = "user_person", def = "{'userId': 1, 'personId': 1}", unique = true)
public class FollowedActor {

    @Id
    private String id;

    private String userId;
    private long personId;
    private String personName;

    /** TMDB ids of movies we've already sent a "new movie" notification for, to avoid repeats. */
    @Builder.Default
    private java.util.Set<Long> notifiedMovieIds = new java.util.HashSet<>();

    private Instant addedAt;
}
