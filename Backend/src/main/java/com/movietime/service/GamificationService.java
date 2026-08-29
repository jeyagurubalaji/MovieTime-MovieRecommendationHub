package com.movietime.service;

import com.movietime.model.GamificationProfile;
import com.movietime.model.GamificationProfile.Badge;
import com.movietime.repository.GamificationProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private static final int DAILY_CHECK_IN_POINTS = 2;
    private static final int WATCHED_POINTS = 5;
    private static final int REVIEW_POINTS = 10;
    private static final int QUIZ_CORRECT_ANSWER_POINTS = 10;
    private static final int WEEK_STREAK_BONUS = 20;
    private static final int MONTH_STREAK_BONUS = 100;

    private final GamificationProfileRepository profileRepository;

    public GamificationProfile getOrCreateProfile(String userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(GamificationProfile.builder().userId(userId).build()));
    }

    /** Called on every successful login. Increments the streak if the last check-in was yesterday, resets if it lapsed. */
    public GamificationProfile checkIn(String userId) {
        GamificationProfile profile = getOrCreateProfile(userId);
        LocalDate today = LocalDate.now();

        if (today.equals(profile.getLastCheckInDate())) {
            return profile; // already checked in today
        }

        boolean isConsecutive = profile.getLastCheckInDate() != null
                && ChronoUnit.DAYS.between(profile.getLastCheckInDate(), today) == 1;

        profile.setCurrentStreak(isConsecutive ? profile.getCurrentStreak() + 1 : 1);
        profile.setLongestStreak(Math.max(profile.getLongestStreak(), profile.getCurrentStreak()));
        profile.setLastCheckInDate(today);
        profile.setPoints(profile.getPoints() + DAILY_CHECK_IN_POINTS);

        if (profile.getCurrentStreak() == 7) {
            profile.setPoints(profile.getPoints() + WEEK_STREAK_BONUS);
            awardBadge(profile, "week_streak", "Weekly Regular", "7-day login streak", "🔥");
        }
        if (profile.getCurrentStreak() == 30) {
            profile.setPoints(profile.getPoints() + MONTH_STREAK_BONUS);
            awardBadge(profile, "month_streak", "Dedicated Viewer", "30-day login streak", "🏆");
        }

        return profileRepository.save(profile);
    }

    public void onMovieWatched(String userId, long totalWatchedCount) {
        GamificationProfile profile = getOrCreateProfile(userId);
        profile.setPoints(profile.getPoints() + WATCHED_POINTS);

        if (totalWatchedCount == 1) {
            awardBadge(profile, "first_watch", "First Watch", "Marked your first movie watched", "🎬");
        }
        if (totalWatchedCount == 10) {
            awardBadge(profile, "movie_buff", "Movie Buff", "Watched 10 movies", "🍿");
        }
        if (totalWatchedCount == 50) {
            awardBadge(profile, "cinephile", "Cinephile", "Watched 50 movies", "🎞️");
        }
        if (totalWatchedCount == 100) {
            awardBadge(profile, "century_club", "Century Club", "Watched 100 movies", "💯");
        }

        profileRepository.save(profile);
    }

    public void onReviewWritten(String userId, long totalReviewCount) {
        GamificationProfile profile = getOrCreateProfile(userId);
        profile.setPoints(profile.getPoints() + REVIEW_POINTS);

        if (totalReviewCount == 1) {
            awardBadge(profile, "first_review", "Critic's Debut", "Wrote your first review", "✍️");
        }
        if (totalReviewCount == 10) {
            awardBadge(profile, "prolific_critic", "Prolific Critic", "Wrote 10 reviews", "📝");
        }

        profileRepository.save(profile);
    }

    public void onFollowedSomeone(String userId, long totalFollowingCount) {
        GamificationProfile profile = getOrCreateProfile(userId);
        if (totalFollowingCount == 5) {
            awardBadge(profile, "social_butterfly", "Social Butterfly", "Followed 5 people", "🦋");
            profileRepository.save(profile);
        }
    }

    public void onQuizCompleted(String userId, int correctAnswers, int totalQuestions) {
        GamificationProfile profile = getOrCreateProfile(userId);
        profile.setPoints(profile.getPoints() + (long) correctAnswers * QUIZ_CORRECT_ANSWER_POINTS);

        if (totalQuestions > 0 && correctAnswers == totalQuestions) {
            awardBadge(profile, "quiz_whiz", "Quiz Whiz", "Got a perfect quiz score", "🧠");
        }

        profileRepository.save(profile);
    }

    private void awardBadge(GamificationProfile profile, String id, String name, String description, String icon) {
        boolean alreadyHas = profile.getBadges().stream().anyMatch(b -> b.getId().equals(id));
        if (!alreadyHas) {
            profile.getBadges().add(Badge.builder()
                    .id(id).name(name).description(description).icon(icon).build());
        }
    }

    public List<GamificationProfile> getLeaderboard(int limit) {
        List<GamificationProfile> top = profileRepository.findTop50ByOrderByPointsDesc();
        return top.size() > limit ? top.subList(0, limit) : top;
    }
}
