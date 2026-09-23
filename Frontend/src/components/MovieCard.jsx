import { Link } from 'react-router-dom'
import { posterUrl } from '../services/movieService'

export default function MovieCard({ movie }) {
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null
  const displayTitle = movie.title || movie.name

  let mediaType = movie.media_type || movie.mediaType
  if (!mediaType) {
    if (movie.profile_path || movie.known_for_department) {
      mediaType = 'person'
    } else if (movie.first_air_date || (movie.name && !movie.title)) {
      mediaType = 'tv'
    } else {
      mediaType = 'movie'
    }
  }

  const imagePath = movie.poster_path || movie.profile_path

  // STRICT FILTER: If there is no image from TMDB, hide this card entirely.
  if (!imagePath) return null;

  const imageSrc = posterUrl(imagePath)

  if (mediaType === 'person') {
    return (
      <div className="movie-card" style={{ cursor: 'default' }}>
        <img
          src={imageSrc}
          alt={displayTitle}
          loading="lazy"
          style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
        />
        <div className="movie-card-title">{displayTitle}</div>
      </div>
    )
  }

  return (
    <Link to={`/movie/${movie.id}?type=${mediaType}`} className="movie-card">
      {rating && <span className="movie-rating">★ {rating}</span>}
      <img
        src={imageSrc}
        alt={displayTitle}
        loading="lazy"
        style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
      />
      <div className="movie-card-title">{displayTitle}</div>
    </Link>
  )
}