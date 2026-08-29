package com.movietime.controller;

import com.movietime.dto.LeaderboardEntryResponse;
import com.movietime.model.GamificationProfile;
import com.movietime.model.User;
import com.movietime.repository.GamificationProfileRepository;
import com.movietime.repository.UserRepository;
import com.movietime.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public GamificationProfile myProfile(@AuthenticationPrincipal User user) {
        return gamificationService.getOrCreateProfile(user.getId());
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntryResponse> leaderboard(@RequestParam(defaultValue = "20") int limit) {
        List<GamificationProfile> profiles = gamificationService.getLeaderboard(limit);
        Map<String, User> usersById = userRepository.findAllById(profiles.stream().map(GamificationProfile::getUserId).toList())
                .stream().collect(java.util.stream.Collectors.toMap(User::getId, u -> u));

        return profiles.stream().map(p -> {
            User u = usersById.get(p.getUserId());
            return LeaderboardEntryResponse.builder()
                    .userId(p.getUserId())
                    .displayName(u != null ? u.getDisplayName() : "Unknown")
                    .profilePictureUrl(u != null ? u.getProfilePictureUrl() : null)
                    .points(p.getPoints())
                    .currentStreak(p.getCurrentStreak())
                    .badgeCount(p.getBadges().size())
                    .build();
        }).toList();
    }
}
