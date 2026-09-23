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
@Document(collection = "follows")
@CompoundIndex(name = "follower_following", def = "{'followerId': 1, 'followingId': 1}", unique = true)
public class Follow {

    @Id
    private String id;

    private String followerId;
    private String followingId;
    private Instant createdAt;
}
