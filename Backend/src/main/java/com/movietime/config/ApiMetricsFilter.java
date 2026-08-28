package com.movietime.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory API call/error counters per endpoint, exposed to admins at GET /api/admin/api-monitoring.
 * Resets on restart - a real deployment would back this with a time-series store, but for a
 * portfolio-scale app this gives a live, honest picture of traffic without extra infrastructure.
 */
@Component
public class ApiMetricsFilter extends OncePerRequestFilter {

    private final Map<String, AtomicLong> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> errorCounts = new ConcurrentHashMap<>();
    private final AtomicLong totalRequests = new AtomicLong();
    private final AtomicLong totalErrors = new AtomicLong();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String key = request.getMethod() + " " + normalizePath(request.getRequestURI());

        filterChain.doFilter(request, response);

        totalRequests.incrementAndGet();
        requestCounts.computeIfAbsent(key, k -> new AtomicLong()).incrementAndGet();

        if (response.getStatus() >= 400) {
            totalErrors.incrementAndGet();
            errorCounts.computeIfAbsent(key, k -> new AtomicLong()).incrementAndGet();
        }
    }

    /** Collapses path variables (ids) so /api/movies/123 and /api/movies/456 count as one endpoint. */
    private String normalizePath(String path) {
        return path.replaceAll("/[a-f0-9]{24}", "/{id}") // Mongo ObjectIds
                .replaceAll("/\\d+", "/{id}");            // numeric ids
    }

    public Map<String, Object> snapshot() {
        Map<String, Long> requests = new ConcurrentHashMap<>();
        requestCounts.forEach((k, v) -> requests.put(k, v.get()));

        Map<String, Long> errors = new ConcurrentHashMap<>();
        errorCounts.forEach((k, v) -> errors.put(k, v.get()));

        return Map.of(
                "totalRequests", totalRequests.get(),
                "totalErrors", totalErrors.get(),
                "requestsByEndpoint", requests,
                "errorsByEndpoint", errors
        );
    }
}
