import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MovieRow from '../components/MovieRow.jsx'
import { movieService, posterUrl } from '../services/movieService'
import { discoveryService } from '../services/discoveryService'

const LISTS = [
  { key: 'trending', title: 'Trending This Week', fetcher: () => movieService.trending('week') },
  { key: 'popular', title: 'Popular Movies', fetcher: () => movieService.popular() },
  { key: 'nowPlaying', title: 'Now Playing', fetcher: () => movieService.nowPlaying() },
  { key: 'upcoming', title: 'Upcoming', fetcher: () => movieService.upcoming() },
  { key: 'topRated', title: 'Top Rated', fetcher: () => movieService.topRated() },
]

function DailyPick() {
  const [movie, setMovie] = useState(null)

  useEffect(() => {
    discoveryService.dailyPick().then(setMovie).catch(() => {})
  }, [])

  if (!movie) return null

  return (
    <Link to={`/movie/${movie.id}`} className="marquee-frame daily-pick-card" style={{ display: 'block', marginTop: 24, textDecoration: 'none', color: 'inherit' }}>
      <div className="daily-pick-inner">
        {movie.poster_path && (
          <img src={posterUrl(movie.poster_path, 'w185')} alt={movie.title} className="daily-pick-img" />
        )}
        <div>
          <span className="eyebrow">🎯 Today's Pick</span>
          <h3 style={{ margin: '6px 0 4px', fontSize: '1.125rem' }}>{movie.title}</h3>
          <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
            {movie.overview?.length > 140 ? movie.overview.slice(0, 140) + '…' : movie.overview}
          </p>
        </div>
      </div>
    </Link>
  )
}

function RandomPickerButton() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const movie = await discoveryService.random()
      if (movie?.id) navigate(`/movie/${movie.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="btn btn-outline" onClick={handleClick} disabled={loading} style={{ width: '100%' }}>
      {loading ? 'Picking…' : '🎲 Surprise Me'}
    </button>
  )
}

export default function Home() {
  const [state, setState] = useState(
    Object.fromEntries(LISTS.map((l) => [l.key, { movies: [], loading: true, error: false }]))
  )

  useEffect(() => {
    LISTS.forEach(({ key, fetcher }) => {
      fetcher()
        .then((data) => {
          setState((s) => ({ ...s, [key]: { movies: data.results || [], loading: false, error: false } }))
        })
        .catch(() => {
          setState((s) => ({ ...s, [key]: { movies: [], loading: false, error: true } }))
        })
    })
  }, [])

  return (
    <div className="page" style={{ overflowX: 'hidden' }}>
      <div className="container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="hero marquee-frame">
          <div className="hero-content">
            <div className="hero-bulbs">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="hero-bulb" />
              ))}
            </div>
            <span className="eyebrow">Now Showing</span>
            <h1 className="display hero-title">Find what to<br />watch tonight</h1>
            <p className="hero-subtitle">
              Trending picks, smart search, and an AI assistant that actually gets your mood —
              all under one marquee.
            </p>
            <div className="hero-actions">
              <Link to="/search" className="btn btn-primary">Start Searching</Link>
              <Link to="/categories" className="btn btn-outline">Browse Categories</Link>
              <RandomPickerButton />
            </div>
          </div>
        </div>

        <DailyPick />

        <div className="film-strip-divider" style={{ margin: '30px 0' }} />

        {LISTS.map(({ key, title }) => (
          <MovieRow
            key={key}
            title={title}
            movies={state[key].movies}
            loading={state[key].loading}
            error={state[key].error}
          />
        ))}
      </div>
    </div>
  )
}