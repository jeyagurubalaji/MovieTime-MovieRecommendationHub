package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.dto.AddLibraryItemRequest;
import com.movietime.dto.MarkWatchedRequest;
import com.movietime.dto.ProgressUpdateRequest;
import com.movietime.model.FollowedActor;
import com.movietime.model.LibraryItem;
import com.movietime.model.LibraryItem.LibraryType;
import com.movietime.repository.FollowedActorRepository;
import com.movietime.repository.LibraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private static final int RECENTLY_VIEWED_CAP = 30;
    private static final int AUTO_FOLLOW_TOP_N_CAST = 2;

    private final LibraryItemRepository libraryItemRepository;
    private final FollowedActorRepository followedActorRepository;
    private final TmdbService tmdbService;
    private final GamificationService gamificationService;

    public List<LibraryItem> list(String userId, LibraryType type) {
        return libraryItemRepository.findByUserIdAndTypeOrderByAddedAtDesc(userId, type);
    }

    public LibraryItem add(String userId, LibraryType type, AddLibraryItemRequest request) {
        LibraryItem item = libraryItemRepository.findByUserIdAndMovieIdAndType(userId, request.getMovieId(), type)
                .orElseGet(() -> libraryItemRepository.save(LibraryItem.builder()
                        .userId(userId)
                        .movieId(request.getMovieId())
                        .type(type)
                        .title(request.getTitle())
                        .posterPath(request.getPosterPath())
                        .releaseDate(request.getReleaseDate())
                        .voteAverage(request.getVoteAverage())
                        .addedAt(Instant.now())
                        .build()));

        if (type == LibraryType.FAVORITE) {
            autoFollowTopCast(userId, request.getMovieId());
        }

        return item;
    }

    /** Favoriting a movie auto-follows its top cast, so "favorite actor's new movie" notifications have a source. */
    private void autoFollowTopCast(String userId, long movieId) {
        try {
            JsonNode credits = tmdbService.getCredits(movieId).block();
            if (credits == null) return;

            StreamSupport.stream(credits.path("cast").spliterator(), false)
                    .limit(AUTO_FOLLOW_TOP_N_CAST)
                    .forEach(c -> {
                        long personId = c.path("id").asLong();
                        String name = c.path("name").asText();
                        if (followedActorRepository.findByUserIdAndPersonId(userId, personId).isEmpty()) {
                            followedActorRepository.save(FollowedActor.builder()
                                    .userId(userId)
                                    .personId(personId)
                                    .personName(name)
                                    .addedAt(Instant.now())
                                    .build());
                        }
                    });
        } catch (Exception ignored) {
            // Best-effort; a TMDB hiccup shouldn't block favoriting a movie.
        }
    }

    public void remove(String userId, LibraryType type, long movieId) {
        libraryItemRepository.deleteByUserIdAndMovieIdAndType(userId, movieId, type);
    }

    public boolean isInList(String userId, LibraryType type, long movieId) {
        return libraryItemRepository.existsByUserIdAndMovieIdAndType(userId, movieId, type);
    }

    public long countWatched(String userId) {
        return libraryItemRepository.countByUserIdAndType(userId, LibraryType.WATCHED);
    }

    /**
     * Marking a movie WATCHED fetches TMDB credits once and snapshots genre/director/cast
     * onto the library item, so the stats dashboard can aggregate favorite genre/actor/director
     * without re-hitting TMDB on every view.
     */
    public LibraryItem markWatched(String userId, MarkWatchedRequest request) {
        LibraryItem existing = libraryItemRepository
                .findByUserIdAndMovieIdAndType(userId, request.getMovieId(), LibraryType.WATCHED)
                .orElse(null);

        LibraryItem.LibraryItemBuilder builder = existing != null
                ? existing.toBuilder()
                : LibraryItem.builder()
                    .userId(userId)
                    .movieId(request.getMovieId())
                    .type(LibraryType.WATCHED)
                    .addedAt(Instant.now());

        builder.title(request.getTitle())
                .posterPath(request.getPosterPath())
                .releaseDate(request.getReleaseDate())
                .voteAverage(request.getVoteAverage())
                .personalRating(request.getPersonalRating())
                .updatedAt(Instant.now());

        LibraryItem item = builder.build();

        try {
            JsonNode movie = tmdbService.getMovieDetails(request.getMovieId()).block();
            if (movie != null) {
                List<String> genreNames = new ArrayList<>();
                movie.path("genres").forEach(g -> genreNames.add(g.path("name").asText()));
                item.setGenreNames(genreNames);

                JsonNode crew = movie.path("credits").path("crew");
                StreamSupport.stream(crew.spliterator(), false)
                        .filter(c -> "Director".equals(c.path("job").asText()))
                        .findFirst()
                        .ifPresent(d -> item.setDirectorName(d.path("name").asText()));

                JsonNode cast = movie.path("credits").path("cast");
                List<String> topCast = StreamSupport.stream(cast.spliterator(), false)
                        .limit(3)
                        .map(c -> c.path("name").asText())
                        .collect(Collectors.toList());
                item.setTopCastNames(topCast);
            }
        } catch (Exception ignored) {
            // Stats enrichment is best-effort; a TMDB hiccup shouldn't block marking a movie watched.
        }

        // Marking watched implies it's no longer "in progress"
        libraryItemRepository.deleteByUserIdAndMovieIdAndType(userId, request.getMovieId(), LibraryType.CONTINUE_WATCHING);

        LibraryItem saved = libraryItemRepository.save(item);

        if (existing == null) {
            long totalWatched = libraryItemRepository.countByUserIdAndType(userId, LibraryType.WATCHED);
            gamificationService.onMovieWatched(userId, totalWatched);
        }

        return saved;
    }

    public void trackRecentlyViewed(String userId, AddLibraryItemRequest request) {
        libraryItemRepository.deleteByUserIdAndMovieIdAndType(userId, request.getMovieId(), LibraryType.RECENTLY_VIEWED);

        libraryItemRepository.save(LibraryItem.builder()
                .userId(userId)
                .movieId(request.getMovieId())
                .type(LibraryType.RECENTLY_VIEWED)
                .title(request.getTitle())
                .posterPath(request.getPosterPath())
                .releaseDate(request.getReleaseDate())
                .voteAverage(request.getVoteAverage())
                .addedAt(Instant.now())
                .build());

        List<LibraryItem> all = libraryItemRepository
                .findByUserIdAndTypeOrderByAddedAtDesc(userId, LibraryType.RECENTLY_VIEWED);
        if (all.size() > RECENTLY_VIEWED_CAP) {
            List<LibraryItem> overflow = all.subList(RECENTLY_VIEWED_CAP, all.size());
            libraryItemRepository.deleteAll(overflow);
        }
    }

    public LibraryItem updateProgress(String userId, ProgressUpdateRequest request) {
        LibraryItem item = libraryItemRepository
                .findByUserIdAndMovieIdAndType(userId, request.getMovieId(), LibraryType.CONTINUE_WATCHING)
                .map(LibraryItem::toBuilder)
                .orElseGet(() -> LibraryItem.builder()
                        .userId(userId)
                        .movieId(request.getMovieId())
                        .type(LibraryType.CONTINUE_WATCHING)
                        .addedAt(Instant.now()))
                .title(request.getTitle())
                .posterPath(request.getPosterPath())
                .progressMinutes(request.getProgressMinutes())
                .totalRuntimeMinutes(request.getTotalRuntimeMinutes())
                .updatedAt(Instant.now())
                .build();

        return libraryItemRepository.save(item);
    }
}
