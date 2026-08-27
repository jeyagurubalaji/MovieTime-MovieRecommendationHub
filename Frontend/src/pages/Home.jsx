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
    <Link to={`/movie/${movie.id}`} className="marquee-frame" style={{ display: 'block', marginTop: 24, textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', gap: 20, padding: 20, alignItems: 'center' }}>
        {movie.poster_path && (
          <img src={posterUrl(movie.poster_path, 'w185')} alt={movie.title} style={{ width: 90, borderRadius: 8, flexShrink: 0 }} />
        )}
        <div>
          <span className="eyebrow">🎯 Today's Pick</span>
          <h3 style={{ margin: '6px 0 4px', fontSize: 18 }}>{movie.title}</h3>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
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
    <button className="btn btn-outline" onClick={handleClick} disabled={loading}>
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
    <div className="page">
      <div className="container">
        <div className="hero marquee-frame">
          <div style={{ padding: '48px 40px', position: 'relative' }}>
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
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/search" className="btn btn-primary">Start Searching</a>
              <a href="/categories" className="btn btn-outline">Browse Categories</a>
              <RandomPickerButton />
            </div>
          </div>
        </div>

        <DailyPick />

        <div className="film-strip-divider" style={{ margin: '40px 0' }} />

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
