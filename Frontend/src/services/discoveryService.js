import api from './api'

export const discoveryService = {
  dailyPick: () => api.get('/discovery/daily-pick').then((r) => r.data),
  random: () => api.get('/discovery/random').then((r) => r.data),
  releaseCalendar: (year, month) => api.get('/discovery/release-calendar', { params: { year, month } }).then((r) => r.data),
  oscarWinners: (limit = 20) => api.get('/discovery/oscar-winners', { params: { limit } }).then((r) => r.data),
  byCountry: (countryCode, page = 1) => api.get(`/discovery/by-country/${countryCode}`, { params: { page } }).then((r) => r.data),
  holiday: (holiday, page = 1) => api.get(`/discovery/holiday/${holiday}`, { params: { page } }).then((r) => r.data),
  familyFriendly: (page = 1) => api.get('/discovery/family-friendly', { params: { page } }).then((r) => r.data),
  featured: () => api.get('/discovery/featured').then((r) => r.data),
}

export const adminService = {
  getUsers: (page = 0, size = 50) => api.get('/admin/users', { params: { page, size } }).then((r) => r.data),
  setAdminRole: (userId, isAdmin) => api.patch(`/admin/users/${userId}/admin-role`, { isAdmin }).then((r) => r.data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  getReviews: (onlyReported = false) => api.get('/admin/reviews', { params: { onlyReported } }).then((r) => r.data),
  hideReview: (reviewId, hidden = true) => api.patch(`/admin/reviews/${reviewId}/hide`, { hidden }),
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),

  getFeaturedMovies: () => api.get('/admin/featured-movies').then((r) => r.data),
  addFeaturedMovie: (movie, note) => api.post('/admin/featured-movies', {
    movieId: movie.id, title: movie.title, posterPath: movie.poster_path, note,
  }).then((r) => r.data),
  removeFeaturedMovie: (movieId) => api.delete(`/admin/featured-movies/${movieId}`),

  getAnalytics: () => api.get('/admin/analytics').then((r) => r.data),
  getApiMetrics: () => api.get('/admin/api-monitoring').then((r) => r.data),
}
