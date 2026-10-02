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
  if (!imagePath) return null

  const imageSrc = posterUrl(imagePath)

  const cardContent = (
    <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      {rating && <span className="movie-rating" style={{ zIndex: 2 }}>★ {rating}</span>}
      <img
        src={imageSrc}
        alt={displayTitle}
        loading="lazy"
        style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
      />
      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          textAlign: 'center'
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '0.95rem',
            lineHeight: '1.25',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {displayTitle}
        </span>
      </div>
    </div>
  )

  if (mediaType === 'person') {
    return (
      <div className="movie-card" style={{ cursor: 'default', width: '100%' }}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link to={`/movie/${movie.id}?type=${mediaType}`} className="movie-card" style={{ display: 'block', width: '100%' }}>
      {cardContent}
    </Link>
  )
}