import api from './api'

export const aiService = {
  searchByDescription: (description, page = 1) =>
    api.post('/ai/search-by-description', { description, page }).then((r) => r.data),

  mood: (mood, page = 1) => api.post('/ai/mood', { mood, page }).then((r) => r.data),

  chat: (message, history = []) => api.post('/ai/chat', { message, history }).then((r) => r.data),

  whatToWatchTonight: (payload) => api.post('/ai/what-to-watch-tonight', payload).then((r) => r.data),

  summarize: (movieId) => api.get(`/ai/summarize/${movieId}`).then((r) => r.data),

  spoilerFreeSummary: (reviews) =>
    api.post('/ai/spoiler-free-summary', { reviews }).then((r) => r.data),
}

export const recommendationService = {
  similar: (movieId, page = 1) =>
    api.get(`/recommendations/${movieId}/similar`, { params: { page } }).then((r) => r.data),

  sameDirector: (movieId, page = 1) =>
    api.get(`/recommendations/${movieId}/same-director`, { params: { page } }).then((r) => r.data),

  sameActor: (movieId, page = 1) =>
    api.get(`/recommendations/${movieId}/same-actor`, { params: { page } }).then((r) => r.data),

  sameGenre: (movieId, page = 1) =>
    api.get(`/recommendations/${movieId}/same-genre`, { params: { page } }).then((r) => r.data),

  becauseYouWatched: (movieId, page = 1) =>
    api.get(`/recommendations/${movieId}/because-you-watched`, { params: { page } }).then((r) => r.data),

  personalized: (payload) => api.post('/recommendations/personalized', payload).then((r) => r.data),

  trendingIn: (region, page = 1) =>
    api.get(`/recommendations/trending-in/${region}`, { params: { page } }).then((r) => r.data),
}
