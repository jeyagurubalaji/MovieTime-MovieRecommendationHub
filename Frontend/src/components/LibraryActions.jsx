import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { libraryService } from '../services/libraryService'

export default function LibraryActions({ movie }) {
  const { isAuthenticated } = useAuth()
  const [status, setStatus] = useState({ isFavorite: false, isInWatchlist: false, isWatched: false, isHidden: false })
  const [loading, setLoading] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(8)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    libraryService.getStatus(movie.id).then(setStatus).finally(() => setLoading(false))
  }, [movie.id, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
        <a href="/login" style={{ color: 'var(--gold)' }}>Sign in</a> to save this to your library.
      </p>
    )
  }

  if (loading) return null

  const toggleFavorite = async () => {
    if (status.isFavorite) {
      await libraryService.removeFavorite(movie.id)
      setStatus((s) => ({ ...s, isFavorite: false }))
    } else {
      await libraryService.addFavorite(movie)
      setStatus((s) => ({ ...s, isFavorite: true }))
    }
  }

  const toggleWatchlist = async () => {
    if (status.isInWatchlist) {
      await libraryService.removeFromWatchlist(movie.id)
      setStatus((s) => ({ ...s, isInWatchlist: false }))
    } else {
      await libraryService.addToWatchlist(movie)
      setStatus((s) => ({ ...s, isInWatchlist: true }))
    }
  }

  const toggleHidden = async () => {
    if (status.isHidden) {
      await libraryService.unhide(movie.id)
      setStatus((s) => ({ ...s, isHidden: false }))
    } else {
      await libraryService.hide(movie)
      setStatus((s) => ({ ...s, isHidden: true }))
    }
  }

  const confirmWatched = async () => {
    await libraryService.markWatched(movie, rating)
    setStatus((s) => ({ ...s, isWatched: true }))
    setShowRating(false)
  }

  const unmarkWatched = async () => {
    await libraryService.removeWatched(movie.id)
    setStatus((s) => ({ ...s, isWatched: false }))
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className={status.isFavorite ? 'btn btn-primary' : 'btn btn-outline'} onClick={toggleFavorite} style={{ fontSize: 13, padding: '9px 16px' }}>
          {status.isFavorite ? '♥ Favorited' : '♡ Favorite'}
        </button>
        <button className={status.isInWatchlist ? 'btn btn-primary' : 'btn btn-outline'} onClick={toggleWatchlist} style={{ fontSize: 13, padding: '9px 16px' }}>
          {status.isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
        </button>
        {status.isWatched ? (
          <button className="btn btn-primary" onClick={unmarkWatched} style={{ fontSize: 13, padding: '9px 16px' }}>
            ✓ Watched
          </button>
        ) : (
          <button className="btn btn-outline" onClick={() => setShowRating((s) => !s)} style={{ fontSize: 13, padding: '9px 16px' }}>
            Mark Watched
          </button>
        )}
        <button className="icon-btn" onClick={toggleHidden} title={status.isHidden ? 'Unhide' : 'Hide this movie'} style={{ width: 36, height: 36, fontSize: 13 }}>
          {status.isHidden ? '🚫' : '👁'}
        </button>
      </div>

      {showRating && (
        <div className="card" style={{ padding: 14, marginTop: 10, maxWidth: 280 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Your rating: {rating}/10</label>
          <input type="range" min="0.5" max="10" step="0.5" value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: '100%', margin: '8px 0 12px' }} />
          <button className="btn btn-primary btn-block" style={{ fontSize: 13 }} onClick={confirmWatched}>Save</button>
        </div>
      )}
    </div>
  )
}
