import api from './api'

export const movieService = {
  trending: (window = 'week', page = 1) =>
    api.get('/movies/trending', { params: { window, page } }).then((r) => r.data),

  popular: (page = 1) => api.get('/movies/popular', { params: { page } }).then((r) => r.data),

  nowPlaying: (page = 1) => api.get('/movies/now-playing', { params: { page } }).then((r) => r.data),

  upcoming: (page = 1) => api.get('/movies/upcoming', { params: { page } }).then((r) => r.data),

  topRated: (page = 1) => api.get('/movies/top-rated', { params: { page } }).then((r) => r.data),

  genres: () => api.get('/movies/genres').then((r) => r.data),

  details: (id) => api.get(`/movies/${id}`).then((r) => r.data),

  discoverByGenre: (genreId, page = 1) =>
    api.get('/movies/discover', { params: { genreId, page } }).then((r) => r.data),

  searchMovies: (query, page = 1) =>
    api.get('/search/movies', { params: { query, page } }).then((r) => r.data),

  searchPeople: (query, page = 1) =>
    api.get('/search/people', { params: { query, page } }).then((r) => r.data),

  credits: (id) => api.get(`/movies/${id}/credits`).then((r) => r.data),

  personDetails: (id) => api.get(`/people/${id}`).then((r) => r.data),

  filter: (params) => api.get('/movies/filter', { params }).then((r) => r.data),
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
export const posterUrl = (path, size = 'w342') =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null
export const backdropUrl = (path, size = 'w1280') =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null
