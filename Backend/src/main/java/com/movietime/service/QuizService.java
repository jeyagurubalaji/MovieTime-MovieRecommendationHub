package com.movietime.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.movietime.model.QuizSession;
import com.movietime.repository.QuizSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class QuizService {

    private static final int QUESTION_COUNT = 5;

    private final TmdbService tmdbService;
    private final QuizSessionRepository quizSessionRepository;
    private final GamificationService gamificationService;

    public record QuizForClient(String id, QuizSession.QuizType type, List<ClientQuestion> questions) {}
    public record ClientQuestion(String id, String prompt, String imageUrl, List<QuizSession.Option> options) {}
    public record QuizResult(int correctAnswers, int totalQuestions, long pointsAwarded,
                              List<AnswerFeedback> feedback) {}
    public record AnswerFeedback(String questionId, boolean correct, String correctOptionId) {}

    public QuizForClient generateTriviaQuiz(String userId) {
        List<JsonNode> pool = fetchMoviePool();
        List<QuizSession.Question> questions = new ArrayList<>();
        Random random = new Random();

        List<JsonNode> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled, random);

        for (JsonNode movie : shuffled) {
            if (questions.size() >= QUESTION_COUNT) break;
            QuizSession.Question q = buildTriviaQuestion(movie, random);
            if (q != null) questions.add(q);
        }

        QuizSession session = quizSessionRepository.save(QuizSession.builder()
                .userId(userId)
                .type(QuizSession.QuizType.TRIVIA)
                .questions(questions)
                .createdAt(Instant.now())
                .build());

        return toClient(session);
    }

    public QuizForClient generateGuessTheMovie(String userId) {
        List<JsonNode> pool = fetchMoviePool();
        List<QuizSession.Question> questions = new ArrayList<>();
        Random random = new Random();

        List<JsonNode> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled, random);

        for (JsonNode movie : shuffled) {
            if (questions.size() >= QUESTION_COUNT) break;
            if (movie.path("poster_path").isMissingNode() || movie.path("poster_path").isNull()) continue;

            List<JsonNode> distractorPool = pool.stream()
                    .filter(m -> m.path("id").asLong() != movie.path("id").asLong())
                    .collect(Collectors.toList());
            Collections.shuffle(distractorPool, random);
            List<JsonNode> distractors = distractorPool.stream().limit(3).toList();
            if (distractors.size() < 3) continue;

            List<QuizSession.Option> options = new ArrayList<>();
            String correctId = UUID.randomUUID().toString();
            options.add(new QuizSession.Option(correctId, movie.path("title").asText()));
            for (JsonNode d : distractors) {
                options.add(new QuizSession.Option(UUID.randomUUID().toString(), d.path("title").asText()));
            }
            Collections.shuffle(options, random);

            questions.add(QuizSession.Question.builder()
                    .id(UUID.randomUUID().toString())
                    .prompt("Which movie is this?")
                    .imageUrl("https://image.tmdb.org/t/p/w500" + movie.path("poster_path").asText())
                    .options(options)
                    .correctOptionId(correctId)
                    .build());
        }

        QuizSession session = quizSessionRepository.save(QuizSession.builder()
                .userId(userId)
                .type(QuizSession.QuizType.GUESS_THE_MOVIE)
                .questions(questions)
                .createdAt(Instant.now())
                .build());

        return toClient(session);
    }

    public QuizResult submitAnswers(String userId, String sessionId, Map<String, String> answers) {
        QuizSession session = quizSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz session not found or already submitted"));

        List<AnswerFeedback> feedback = new ArrayList<>();
        int correct = 0;
        for (QuizSession.Question q : session.getQuestions()) {
            String submitted = answers.get(q.getId());
            boolean isCorrect = q.getCorrectOptionId().equals(submitted);
            if (isCorrect) correct++;
            feedback.add(new AnswerFeedback(q.getId(), isCorrect, q.getCorrectOptionId()));
        }

        gamificationService.onQuizCompleted(userId, correct, session.getQuestions().size());
        quizSessionRepository.deleteById(sessionId); // one-shot session

        long pointsAwarded = correct * 10L;
        return new QuizResult(correct, session.getQuestions().size(), pointsAwarded, feedback);
    }

    // --- helpers ---

    private List<JsonNode> fetchMoviePool() {
        JsonNode popular = tmdbService.getPopular(1).block();
        JsonNode topRated = tmdbService.getTopRated(1).block();

        List<JsonNode> pool = new ArrayList<>();
        if (popular != null) StreamSupport.stream(popular.path("results").spliterator(), false).forEach(pool::add);
        if (topRated != null) StreamSupport.stream(topRated.path("results").spliterator(), false).forEach(pool::add);
        return pool;
    }

    private QuizSession.Question buildTriviaQuestion(JsonNode movie, Random random) {
        String title = movie.path("title").asText();
        String releaseDate = movie.path("release_date").asText("");
        if (releaseDate.length() < 4) return null;
        String year = releaseDate.substring(0, 4);

        // "What year was X released?" with 3 nearby-but-wrong year distractors
        Set<String> years = new LinkedHashSet<>();
        years.add(year);
        int yearInt = Integer.parseInt(year);
        while (years.size() < 4) {
            int offset = random.nextInt(9) - 4;
            if (offset == 0) continue;
            years.add(String.valueOf(yearInt + offset));
        }

        List<QuizSession.Option> options = new ArrayList<>();
        String correctId = UUID.randomUUID().toString();
        List<String> shuffledYears = new ArrayList<>(years);
        Collections.shuffle(shuffledYears, random);
        for (String y : shuffledYears) {
            String optId = y.equals(year) ? correctId : UUID.randomUUID().toString();
            options.add(new QuizSession.Option(optId, y));
        }

        return QuizSession.Question.builder()
                .id(UUID.randomUUID().toString())
                .prompt("What year was \"" + title + "\" released?")
                .options(options)
                .correctOptionId(correctId)
                .build();
    }

    private QuizForClient toClient(QuizSession session) {
        List<ClientQuestion> clientQuestions = session.getQuestions().stream()
                .map(q -> new ClientQuestion(q.getId(), q.getPrompt(), q.getImageUrl(), q.getOptions()))
                .toList();
        return new QuizForClient(session.getId(), session.getType(), clientQuestions);
    }
}
