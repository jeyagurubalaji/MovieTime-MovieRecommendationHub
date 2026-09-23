import api from './api'

export const aiService = {
  searchByDescription: (description, page = 1) =>
    api.post('/ai/search-by-description', { description, page }).then((r) => r.data),

  mood: (mood, page = 1) => api.post('/ai/mood', { mood, page }).then((r) => r.data),

  chat: (message, history = []) => api.post('/ai/chat', { message, history }).then((r) => r.data),

  whatToWatchTonight: (payload) => api.post('/ai/what-to-watch-tonight', payload).then((r) => r.data),

  summarize: (id, type = 'movie') =>
      api.get(`/ai/summarize/${id}`, { params: { type } }).then((r) => r.data),

  spoilerFreeSummary: (reviews) =>
    api.post('/ai/spoiler-free-summary', { reviews }).then((r) => r.data),
}

export const recommendationService = {
  similar: (movieId, mediaType = 'movie', page = 1) =>
    api.get(`/recommendations/${movieId}/similar`, { params: { page, type: mediaType } }).then((r) => r.data),

  sameDirector: (movieId, mediaType = 'movie', page = 1) =>
    api.get(`/recommendations/${movieId}/same-director`, { params: { page, type: mediaType } }).then((r) => r.data),

  sameActor: (movieId, mediaType = 'movie', page = 1) =>
    api.get(`/recommendations/${movieId}/same-actor`, { params: { page, type: mediaType } }).then((r) => r.data),

  sameGenre: (movieId, mediaType = 'movie', page = 1) =>
    api.get(`/recommendations/${movieId}/same-genre`, { params: { page, type: mediaType } }).then((r) => r.data),

  becauseYouWatched: (movieId, mediaType = 'movie', page = 1) =>
    api.get(`/recommendations/${movieId}/because-you-watched`, { params: { page, type: mediaType } }).then((r) => r.data),

  personalized: (payload) => api.post('/recommendations/personalized', payload).then((r) => r.data),

  trendingIn: (region, page = 1) =>
    api.get(`/recommendations/trending-in/${region}`, { params: { page } }).then((r) => r.data),
}
