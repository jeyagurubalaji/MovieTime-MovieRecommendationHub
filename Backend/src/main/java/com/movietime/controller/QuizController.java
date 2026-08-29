package com.movietime.controller;

import com.movietime.model.User;
import com.movietime.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gamification/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/trivia")
    public QuizService.QuizForClient triviaQuiz(@AuthenticationPrincipal User user) {
        return quizService.generateTriviaQuiz(user.getId());
    }

    @PostMapping("/guess-the-movie")
    public QuizService.QuizForClient guessTheMovie(@AuthenticationPrincipal User user) {
        return quizService.generateGuessTheMovie(user.getId());
    }

    @PostMapping("/{sessionId}/submit")
    public QuizService.QuizResult submit(@AuthenticationPrincipal User user, @PathVariable String sessionId,
                                          @RequestBody Map<String, String> answers) {
        return quizService.submitAnswers(user.getId(), sessionId, answers);
    }
}
