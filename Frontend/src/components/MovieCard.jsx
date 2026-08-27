import { Link } from 'react-router-dom'
import { posterUrl } from '../services/movieService'

export default function MovieCard({ movie }) {
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card">
      {rating && <span className="movie-rating">★ {rating}</span>}
      {movie.poster_path ? (
        <img src={posterUrl(movie.poster_path)} alt={movie.title} loading="lazy" />
      ) : (
        <div style={{ aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No poster
        </div>
      )}
      <div className="movie-card-title">{movie.title}</div>
    </Link>
  )
}
