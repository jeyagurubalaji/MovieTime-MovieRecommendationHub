package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/daily-pick")
    public JsonNode dailyPick() {
        return discoveryService.getDailyPick();
    }

    @GetMapping("/random")
    public JsonNode random() {
        return discoveryService.getRandomMovie();
    }

    @GetMapping("/release-calendar")
    public List<JsonNode> releaseCalendar(@RequestParam(required = false) Integer year,
                                           @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        return discoveryService.getReleaseCalendar(year != null ? year : now.getYear(), month != null ? month : now.getMonthValue());
    }

    @GetMapping("/oscar-winners")
    public List<JsonNode> oscarWinners(@RequestParam(defaultValue = "20") int limit) {
        return discoveryService.getOscarWinners(limit);
    }

    @GetMapping("/by-country/{countryCode}")
    public List<JsonNode> byCountry(@PathVariable String countryCode, @RequestParam(defaultValue = "1") int page) {
        return discoveryService.getMoviesByCountry(countryCode.toUpperCase(), page);
    }

    @GetMapping("/holiday/{holiday}")
    public List<JsonNode> holiday(@PathVariable String holiday, @RequestParam(defaultValue = "1") int page) {
        return discoveryService.getHolidayCollection(holiday, page);
    }

    @GetMapping("/family-friendly")
    public List<JsonNode> familyFriendly(@RequestParam(defaultValue = "1") int page) {
        return discoveryService.getFamilyFriendly(page);
    }

    @GetMapping("/featured")
    public List<com.movietime.model.FeaturedMovie> featured() {
        return discoveryService.getFeaturedMovies();
    }
}
