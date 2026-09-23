import api from './api'

export const reviewService = {
  getForMovie: (movieId) => api.get(`/reviews/movie/${movieId}`).then((r) => r.data),

  create: (movieId, rating, text, spoiler = false) =>
    api.post('/reviews', { movieId, rating, text, spoiler }).then((r) => r.data),

  toggleLike: (reviewId) => api.post(`/reviews/${reviewId}/like`).then((r) => r.data),

  reply: (reviewId, text) => api.post(`/reviews/${reviewId}/reply`, { text }).then((r) => r.data),

  report: (reviewId) => api.post(`/reviews/${reviewId}/report`).then((r) => r.data),

  remove: (reviewId) => api.delete(`/reviews/${reviewId}`),
}
