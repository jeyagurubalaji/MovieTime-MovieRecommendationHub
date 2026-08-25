import api from './api'

export const libraryService = {
  // Favorites
  getFavorites: () => api.get('/library/favorites').then((r) => r.data),
  addFavorite: (movie) => api.post('/library/favorites', movieSnapshot(movie)).then((r) => r.data),
  removeFavorite: (movieId) => api.delete(`/library/favorites/${movieId}`),

  // Watchlist
  getWatchlist: () => api.get('/library/watchlist').then((r) => r.data),
  addToWatchlist: (movie) => api.post('/library/watchlist', movieSnapshot(movie)).then((r) => r.data),
  removeFromWatchlist: (movieId) => api.delete(`/library/watchlist/${movieId}`),

  // Watched
  getWatched: () => api.get('/library/watched').then((r) => r.data),
  markWatched: (movie, personalRating) =>
    api.post('/library/watched', { ...movieSnapshot(movie), personalRating }).then((r) => r.data),
  removeWatched: (movieId) => api.delete(`/library/watched/${movieId}`),

  // Hidden
  getHidden: () => api.get('/library/hidden').then((r) => r.data),
  hide: (movie) => api.post('/library/hidden', movieSnapshot(movie)).then((r) => r.data),
  unhide: (movieId) => api.delete(`/library/hidden/${movieId}`),

  // Recently viewed (auto-tracked)
  getRecentlyViewed: () => api.get('/library/recently-viewed').then((r) => r.data),
  trackRecentlyViewed: (movie) => api.post('/library/recently-viewed', movieSnapshot(movie)),

  // Continue watching
  getContinueWatching: () => api.get('/library/continue-watching').then((r) => r.data),
  updateProgress: (movie, progressMinutes, totalRuntimeMinutes) =>
    api.put('/library/continue-watching', {
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      progressMinutes,
      totalRuntimeMinutes,
    }).then((r) => r.data),
  removeContinueWatching: (movieId) => api.delete(`/library/continue-watching/${movieId}`),

  // Status check (for button states on a movie details page)
  getStatus: (movieId) => api.get(`/library/status/${movieId}`).then((r) => r.data),
}

function movieSnapshot(movie) {
  return {
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
  }
}
