import api from './api'

export const notificationService = {
  list: () => api.get('/notifications').then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data.count),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  registerDeviceToken: (token) => api.post('/notifications/device-token', { token }),
  unregisterDeviceToken: (token) => api.delete('/notifications/device-token', { data: { token } }),
  checkNow: () => api.post('/notifications/check-now').then((r) => r.data),
}

export const gamificationService = {
  getMyProfile: () => api.get('/gamification/me').then((r) => r.data),
  getLeaderboard: (limit = 20) => api.get('/gamification/leaderboard', { params: { limit } }).then((r) => r.data),
}

export const quizService = {
  startTrivia: () => api.post('/gamification/quiz/trivia').then((r) => r.data),
  startGuessTheMovie: () => api.post('/gamification/quiz/guess-the-movie').then((r) => r.data),
  submit: (sessionId, answers) => api.post(`/gamification/quiz/${sessionId}/submit`, answers).then((r) => r.data),
}
