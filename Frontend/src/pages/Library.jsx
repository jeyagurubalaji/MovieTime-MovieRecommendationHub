import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { posterUrl } from '../services/movieService'
import { libraryService } from '../services/libraryService'

const TABS = [
  { key: 'favorites', label: 'Favorites' },
  { key: 'watchlist', label: 'Watchlist' },
  { key: 'watched', label: 'Watched' },
  { key: 'continueWatching', label: 'Continue Watching' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'recentlyViewed', label: 'Recently Viewed' },
]

const FETCHERS = {
  favorites: libraryService.getFavorites,
  watchlist: libraryService.getWatchlist,
  watched: libraryService.getWatched,
  continueWatching: libraryService.getContinueWatching,
  hidden: libraryService.getHidden,
  recentlyViewed: libraryService.getRecentlyViewed,
}

const REMOVERS = {
  favorites: libraryService.removeFavorite,
  watchlist: libraryService.removeFromWatchlist,
  watched: libraryService.removeWatched,
  continueWatching: libraryService.removeContinueWatching,
  hidden: libraryService.unhide,
}

function LibraryCard({ item, onRemove }) {
  return (
    <div className="movie-card" style={{ position: 'relative' }}>
      <Link to={`/movie/${item.movieId}`}>
        {item.posterPath ? (
          <img src={posterUrl(item.posterPath)} alt={item.title} loading="lazy" />
        ) : (
          <div style={{ aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No poster
          </div>
        )}
        <div className="movie-card-title">{item.title}</div>
      </Link>

      {item.personalRating != null && (
        <span className="movie-rating">You: {item.personalRating}</span>
      )}

      {item.progressMinutes != null && item.totalRuntimeMinutes && (
        <div style={{ position: 'absolute', bottom: 44, left: 0, right: 0, height: 4, background: 'var(--surface-raised)' }}>
          <div style={{ height: '100%', width: `${Math.min(100, (item.progressMinutes / item.totalRuntimeMinutes) * 100)}%`, background: 'var(--gold)' }} />
        </div>
      )}

      {onRemove && (
        <button
          onClick={() => onRemove(item.movieId)}
          className="icon-btn"
          style={{ position: 'absolute', top: 8, left: 8, width: 28, height: 28, fontSize: 12, background: 'rgba(11,14,26,0.8)' }}
          title="Remove"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default function Library() {
  const [activeTab, setActiveTab] = useState('favorites')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    FETCHERS[activeTab]()
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(load, [activeTab])

  const handleRemove = async (movieId) => {
    const remover = REMOVERS[activeTab]
    if (!remover) return
    await remover(movieId)
    setItems((prev) => prev.filter((i) => i.movieId !== movieId))
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Your Collection</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>My Library</h1>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '24px 0 28px', borderBottom: '1px solid var(--border)', paddingBottom: 4, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={activeTab === t.key ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="movie-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 10 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="muted">Nothing here yet.</p>
        ) : (
          <div className="movie-row">
            {items.map((item) => (
              <LibraryCard key={item.id} item={item} onRemove={REMOVERS[activeTab] ? handleRemove : null} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
