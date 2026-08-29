package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.model.FollowedActor;
import com.movietime.model.LibraryItem;
import com.movietime.model.Notification;
import com.movietime.repository.FollowedActorRepository;
import com.movietime.repository.LibraryItemRepository;
import com.movietime.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.StreamSupport;

/**
 * Checks that generate notifications. Runs on a daily schedule, and can also be triggered
 * on demand via POST /api/notifications/check-now - useful for demoing without waiting for cron,
 * since a real deployment's user base won't be sitting around watching a scheduled job fire.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final LibraryItemRepository libraryItemRepository;
    private final FollowedActorRepository followedActorRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final TmdbService tmdbService;

    /** Runs once a day at 9am server time. */
    @Scheduled(cron = "0 0 9 * * *")
    public void runDailyChecks() {
        log.info("Running scheduled notification checks");
        checkWatchlistReleases();
        checkFollowedActorNewMovies();
        checkActorBirthdays();
    }

    public void checkActorBirthdays() {
        java.time.MonthDay today = java.time.MonthDay.now();
        for (FollowedActor followedActor : followedActorRepository.findAll()) {
            try {
                JsonNode person = tmdbService.getPersonDetails(followedActor.getPersonId()).block();
                if (person == null) continue;

                String birthday = person.path("birthday").asText(null);
                if (birthday == null || birthday.isBlank()) continue;

                java.time.LocalDate birthDate = java.time.LocalDate.parse(birthday);
                if (!java.time.MonthDay.from(birthDate).equals(today)) continue;

                // Birthdays recur yearly, so we don't dedupe against NotificationRepository the way
                // release/new-movie checks do - one ping per year per actor is the expected behavior.
                notificationService.notify(
                        followedActor.getUserId(),
                        Notification.NotificationType.FAVORITE_ACTOR_NEW_MOVIE,
                        "It's " + followedActor.getPersonName() + "'s birthday!",
                        "One of your favorite actors, " + followedActor.getPersonName() + ", has a birthday today.",
                        null
                );
            } catch (Exception e) {
                log.debug("Skipping birthday check for {}: {}", followedActor.getPersonName(), e.getMessage());
            }
        }
    }

    public void checkWatchlistReleases() {
        LocalDate today = LocalDate.now();
        for (LibraryItem item : libraryItemRepository.findByType(LibraryItem.LibraryType.WATCHLIST)) {
            if (item.getReleaseDate() == null || item.getReleaseDate().isBlank()) continue;

            try {
                LocalDate releaseDate = LocalDate.parse(item.getReleaseDate(), ISO_DATE);
                if (releaseDate.isAfter(today)) continue; // not released yet

                boolean alreadyNotified = notificationRepository.existsByUserIdAndMovieIdAndType(
                        item.getUserId(), item.getMovieId(), Notification.NotificationType.WATCHLIST_REMINDER);
                if (alreadyNotified) continue;

                notificationService.notify(
                        item.getUserId(),
                        Notification.NotificationType.WATCHLIST_REMINDER,
                        "Now available: " + item.getTitle(),
                        item.getTitle() + " from your watchlist is out now.",
                        item.getMovieId()
                );
            } catch (Exception e) {
                log.debug("Skipping watchlist item with unparsable release date: {}", item.getReleaseDate());
            }
        }
    }

    public void checkFollowedActorNewMovies() {
        for (FollowedActor followedActor : followedActorRepository.findAll()) {
            try {
                JsonNode discovered = tmdbService.discoverByCast(followedActor.getPersonId()).block();
                if (discovered == null) continue;

                StreamSupport.stream(discovered.path("results").spliterator(), false)
                        .limit(5)
                        .forEach(movie -> {
                            long movieId = movie.path("id").asLong();
                            if (followedActor.getNotifiedMovieIds().contains(movieId)) return;

                            String title = movie.path("title").asText();
                            notificationService.notify(
                                    followedActor.getUserId(),
                                    Notification.NotificationType.FAVORITE_ACTOR_NEW_MOVIE,
                                    followedActor.getPersonName() + " has a new movie",
                                    title + " features " + followedActor.getPersonName() + ".",
                                    movieId
                            );
                            followedActor.getNotifiedMovieIds().add(movieId);
                        });

                followedActorRepository.save(followedActor);
            } catch (Exception e) {
                log.debug("Skipping followed actor {} due to TMDB error: {}", followedActor.getPersonName(), e.getMessage());
            }
        }
    }
}
