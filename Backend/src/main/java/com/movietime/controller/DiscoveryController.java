package com.movietime.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.movietime.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/daily-pick")
    public Object dailyPick() {
        JsonNode pick = discoveryService.getDailyPick();
        return pick != null ? mapper.convertValue(pick, Object.class) : null;
    }

    @GetMapping("/random")
    public Object random() {
        JsonNode randomMovie = discoveryService.getRandomMovie();
        return randomMovie != null ? mapper.convertValue(randomMovie, Object.class) : null;
    }

    @GetMapping("/release-calendar")
    public List<Object> releaseCalendar(@RequestParam(required = false) Integer year,
                                        @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        int targetYear = year != null ? year : now.getYear();
        int targetMonth = month != null ? month : now.getMonthValue();

        return discoveryService.getReleaseCalendar(targetYear, targetMonth).stream()
                .map(node -> mapper.convertValue(node, Object.class))
                .collect(Collectors.toList());
    }

    @GetMapping("/oscar-winners")
    public List<Object> oscarWinners(@RequestParam(defaultValue = "20") int limit) {
        return discoveryService.getOscarWinners(limit).stream()
                .map(node -> mapper.convertValue(node, Object.class))
                .collect(Collectors.toList());
    }

    @GetMapping("/by-country/{countryCode}")
    public List<Object> byCountry(@PathVariable String countryCode, @RequestParam(defaultValue = "1") int page) {
        return discoveryService.getMoviesByCountry(countryCode.toUpperCase(), page).stream()
                .map(node -> mapper.convertValue(node, Object.class))
                .collect(Collectors.toList());
    }

    @GetMapping("/holiday/{holiday}")
    public List<Object> holiday(@PathVariable String holiday, @RequestParam(defaultValue = "1") int page) {
        return discoveryService.getHolidayCollection(holiday, page).stream()
                .map(node -> mapper.convertValue(node, Object.class))
                .collect(Collectors.toList());
    }

    @GetMapping("/family-friendly")
    public List<Object> familyFriendly(@RequestParam(defaultValue = "1") int page) {
        return discoveryService.getFamilyFriendly(page).stream()
                .map(node -> mapper.convertValue(node, Object.class))
                .collect(Collectors.toList());
    }

    @GetMapping("/featured")
    public List<com.movietime.model.FeaturedMovie> featured() {
        // FeaturedMovie is a standard Java object (not JsonNode), so it does not need conversion
        return discoveryService.getFeaturedMovies();
    }
}