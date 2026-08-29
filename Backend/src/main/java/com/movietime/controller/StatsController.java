package com.movietime.controller;

import com.movietime.dto.StatsResponse;
import com.movietime.model.User;
import com.movietime.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/me")
    public StatsResponse myStats(@AuthenticationPrincipal User user) {
        return statsService.getStatsForUser(user.getId());
    }
}
