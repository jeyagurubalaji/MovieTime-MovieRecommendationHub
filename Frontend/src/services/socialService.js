import api from './api'

export const statsService = {
  getMyStats: () => api.get('/stats/me').then((r) => r.data),
}

export const socialService = {
  follow: (userId) => api.post(`/social/follow/${userId}`),
  unfollow: (userId) => api.delete(`/social/follow/${userId}`),
  getFollowers: (userId) => api.get(`/social/${userId}/followers`).then((r) => r.data),
  getFollowing: (userId) => api.get(`/social/${userId}/following`).then((r) => r.data),
  getTopReviewers: (limit = 10) => api.get('/social/top-reviewers', { params: { limit } }).then((r) => r.data),
  getTrendingReviews: (limit = 10) => api.get('/social/trending-reviews', { params: { limit } }).then((r) => r.data),
  getPublicProfile: (userId) => api.get(`/users/${userId}/public-profile`).then((r) => r.data),
  getPublicWatchlist: (userId) => api.get(`/users/${userId}/public-watchlist`).then((r) => r.data),
  updateBio: (bio) => api.patch('/users/me/bio', { bio }).then((r) => r.data),
  updatePrivacy: (settings) => api.patch('/users/me/privacy', settings).then((r) => r.data),
}
