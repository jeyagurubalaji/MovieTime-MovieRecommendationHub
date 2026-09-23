import api from './api'

export const gamificationService = {
  getMyProfile: () => api.get('/gamification/me').then((r) => r.data),
  getLeaderboard: (limit = 20) => api.get('/gamification/leaderboard', { params: { limit } }).then((r) => r.data),
}

export const quizService = {
  startTrivia: () => api.post('/gamification/quiz/trivia').then((r) => r.data),
  startGuessTheMovie: () => api.post('/gamification/quiz/guess-the-movie').then((r) => r.data),
  submit: (sessionId, answers) => api.post(`/gamification/quiz/${sessionId}/submit`, answers).then((r) => r.data),
}