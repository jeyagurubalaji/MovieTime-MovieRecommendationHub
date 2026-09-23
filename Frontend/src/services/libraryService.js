import api from './api'

export const libraryService = {
  // Favorites
  getFavorites: () => api.get('/library/favorites').then((r) => r.data),
  addFavorite: (movie, mediaType) => api.post('/library/favorites', movieSnapshot(movie, mediaType)).then((r) => r.data),
  removeFavorite: (movieId) => api.delete(`/library/favorites/${movieId}`),

  // Watchlist
  getWatchlist: () => api.get('/library/watchlist').then((r) => r.data),
  addToWatchlist: (movie, mediaType) => api.post('/library/watchlist', movieSnapshot(movie, mediaType)).then((r) => r.data),
  removeFromWatchlist: (movieId) => api.delete(`/library/watchlist/${movieId}`),

  // Watched
  getWatched: () => api.get('/library/watched').then((r) => r.data),
  markWatched: (movie, personalRating, mediaType) =>
    api.post('/library/watched', { ...movieSnapshot(movie, mediaType), personalRating }).then((r) => r.data),
  removeWatched: (movieId) => api.delete(`/library/watched/${movieId}`),

  // Hidden
  getHidden: () => api.get('/library/hidden').then((r) => r.data),
  hide: (movie, mediaType) => api.post('/library/hidden', movieSnapshot(movie, mediaType)).then((r) => r.data),
  unhide: (movieId) => api.delete(`/library/hidden/${movieId}`),

  // Recently viewed (auto-tracked)
  getRecentlyViewed: () => api.get('/library/recently-viewed').then((r) => r.data),
  trackRecentlyViewed: (movie, mediaType) => api.post('/library/recently-viewed', movieSnapshot(movie, mediaType)),

  // Continue watching
  getContinueWatching: () => api.get('/library/continue-watching').then((r) => r.data),
  updateProgress: (movie, progressMinutes, totalRuntimeMinutes, mediaType) =>
    api.put('/library/continue-watching', {
      movieId: movie.id,
      mediaType: mediaType || 'movie',
      title: movie.title || movie.name,
      posterPath: movie.poster_path,
      progressMinutes,
      totalRuntimeMinutes,
    }).then((r) => r.data),
  removeContinueWatching: (movieId) => api.delete(`/library/continue-watching/${movieId}`),

  // Status check (for button states on a movie details page)
  getStatus: (movieId) => api.get(`/library/status/${movieId}`).then((r) => r.data),
}

function movieSnapshot(movie, mediaType = 'movie') {
  return {
    movieId: movie.id,
    mediaType: mediaType, // Sends the flag to Spring Boot
    title: movie.title || movie.name, // Handles TV show fallback
    posterPath: movie.poster_path,
    releaseDate: movie.release_date || movie.first_air_date, // Handles TV show fallback
    voteAverage: movie.vote_average,
  }
}