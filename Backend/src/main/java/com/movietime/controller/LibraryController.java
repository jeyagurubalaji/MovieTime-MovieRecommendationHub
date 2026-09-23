package com.movietime.controller;

import com.movietime.dto.AddLibraryItemRequest;
import com.movietime.dto.LibraryItemResponse;
import com.movietime.dto.MarkWatchedRequest;
import com.movietime.dto.ProgressUpdateRequest;
import com.movietime.model.LibraryItem.LibraryType;
import com.movietime.model.User;
import com.movietime.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping("/favorites")
    public List<LibraryItemResponse> favorites(@AuthenticationPrincipal User user) {
        return map(libraryService.list(user.getId(), LibraryType.FAVORITE));
    }

    @PostMapping("/favorites")
    public ResponseEntity<LibraryItemResponse> addFavorite(@AuthenticationPrincipal User user,
                                                             @Valid @RequestBody AddLibraryItemRequest request) {
        var item = libraryService.add(user.getId(), LibraryType.FAVORITE, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(LibraryItemResponse.fromEntity(item));
    }

    @DeleteMapping("/favorites/{movieId}")
    public ResponseEntity<Void> removeFavorite(@AuthenticationPrincipal User user, @PathVariable long movieId) {
        libraryService.remove(user.getId(), LibraryType.FAVORITE, movieId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/watchlist")
    public List<LibraryItemResponse> watchlist(@AuthenticationPrincipal User user) {
        return map(libraryService.list(user.getId(), LibraryType.WATCHLIST));
    }

    @PostMapping("/watchlist")
    public ResponseEntity<LibraryItemResponse> addToWatchlist(@AuthenticationPrincipal User user,
                                                                @Valid @RequestBody AddLibraryItemRequest request) {
        var item = libraryService.add(user.getId(), LibraryType.WATCHLIST, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(LibraryItemResponse.fromEntity(item));
    }

    @DeleteMapping("/watchlist/{movieId}")
    public ResponseEntity<Void> removeFromWatchlist(@AuthenticationPrincipal User user, @PathVariable long movieId) {
        libraryService.remove(user.getId(), LibraryType.WATCHLIST, movieId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/watched")
    public List<LibraryItemResponse> watched(@AuthenticationPrincipal User user) {
        return map(libraryService.list(user.getId(), LibraryType.WATCHED));
    }

    @PostMapping("/watched")
    public ResponseEntity<LibraryItemResponse> markWatched(@AuthenticationPrincipal User user,
                                                             @Valid @RequestBody MarkWatchedRequest request) {
        var item = libraryService.markWatched(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(LibraryItemResponse.fromEntity(item));
    }

    @DeleteMapping("/watched/{movieId}")
    public ResponseEntity<Void> removeWatched(@AuthenticationPrincipal User user, @PathVariable long movieId) {
        libraryService.remove(user.getId(), LibraryType.WATCHED, movieId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/hidden")
    public List<LibraryItemResponse> hidden(@AuthenticationPrincipal User user) {
        return map(libraryService.list(user.getId(), LibraryType.HIDDEN));
    }

    @PostMapping("/hidden")
    public ResponseEntity<LibraryItemResponse> hide(@AuthenticationPrincipal User user,
                                                      @Valid @RequestBody AddLibraryItemRequest request) {
        var item = libraryService.add(user.getId(), LibraryType.HIDDEN, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(LibraryItemResponse.fromEntity(item));
    }

    @DeleteMapping("/hidden/{movieId}")
    public ResponseEntity<Void> unhide(@AuthenticationPrincipal User user, @PathVariable long movieId) {
        libraryService.remove(user.getId(), LibraryType.HIDDEN, movieId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recently-viewed")
    public List<LibraryItemResponse> recentlyViewed(@AuthenticationPrincipal User user) {
        return map(libraryService.list(user.getId(), LibraryType.RECENTLY_VIEWED));
    }

    @PostMapping("/recently-viewed")
    public ResponseEntity<Void> trackRecentlyViewed(@AuthenticationPrincipal User user,
                                                      @Valid @RequestBody AddLibraryItemRequest request) {
        libraryService.trackRecentlyViewed(user.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/continue-watching")
    public List<LibraryItemResponse> continueWatching(@AuthenticationPrincipal User user) {
        return map(libraryService.list(user.getId(), LibraryType.CONTINUE_WATCHING));
    }

    @PutMapping("/continue-watching")
    public LibraryItemResponse updateProgress(@AuthenticationPrincipal User user,
                                                @Valid @RequestBody ProgressUpdateRequest request) {
        return LibraryItemResponse.fromEntity(libraryService.updateProgress(user.getId(), request));
    }

    @DeleteMapping("/continue-watching/{movieId}")
    public ResponseEntity<Void> removeContinueWatching(@AuthenticationPrincipal User user, @PathVariable long movieId) {
        libraryService.remove(user.getId(), LibraryType.CONTINUE_WATCHING, movieId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{movieId}")
    public Map<String, Boolean> status(@AuthenticationPrincipal User user, @PathVariable long movieId) {
        return Map.of(
                "isFavorite", libraryService.isInList(user.getId(), LibraryType.FAVORITE, movieId),
                "isInWatchlist", libraryService.isInList(user.getId(), LibraryType.WATCHLIST, movieId),
                "isWatched", libraryService.isInList(user.getId(), LibraryType.WATCHED, movieId),
                "isHidden", libraryService.isInList(user.getId(), LibraryType.HIDDEN, movieId)
        );
    }

    private List<LibraryItemResponse> map(List<com.movietime.model.LibraryItem> items) {
        return items.stream().map(LibraryItemResponse::fromEntity).toList();
    }
}
