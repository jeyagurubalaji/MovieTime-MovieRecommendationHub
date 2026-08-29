package com.movietime.controller;

import com.movietime.model.Notification;
import com.movietime.model.User;
import com.movietime.service.FcmService;
import com.movietime.service.NotificationScheduler;
import com.movietime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationScheduler notificationScheduler;
    private final FcmService fcmService;

    @GetMapping
    public List<Notification> list(@AuthenticationPrincipal User user) {
        return notificationService.list(user.getId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal User user) {
        return Map.of("count", notificationService.unreadCount(user.getId()));
    }

    @PatchMapping("/{id}/read")
    public void markRead(@AuthenticationPrincipal User user, @PathVariable String id) {
        notificationService.markRead(user.getId(), id);
    }

    @PatchMapping("/read-all")
    public void markAllRead(@AuthenticationPrincipal User user) {
        notificationService.markAllRead(user.getId());
    }

    @PostMapping("/device-token")
    public void registerDeviceToken(@AuthenticationPrincipal User user, @RequestBody Map<String, String> body) {
        fcmService.registerToken(user.getId(), body.get("token"));
    }

    @DeleteMapping("/device-token")
    public void unregisterDeviceToken(@RequestBody Map<String, String> body) {
        fcmService.unregisterToken(body.get("token"));
    }

    /**
     * Manually fires the scheduled checks immediately. Handy for demoing/testing without waiting
     * for the daily cron - in production this would typically be admin-gated, but it's left open
     * to any authenticated user here since it only evaluates real data (no destructive side effects).
     */
    @PostMapping("/check-now")
    public Map<String, String> checkNow() {
        notificationScheduler.checkWatchlistReleases();
        notificationScheduler.checkFollowedActorNewMovies();
        notificationScheduler.checkActorBirthdays();
        return Map.of("status", "checks completed");
    }
}
