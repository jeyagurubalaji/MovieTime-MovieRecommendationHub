import { useEffect, useState } from 'react'
import MovieCard from '../components/MovieCard.jsx'
import { discoveryService } from '../services/discoveryService'

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'IN', label: 'India' },
  { code: 'KR', label: 'South Korea' },
  { code: 'JP', label: 'Japan' },
  { code: 'FR', label: 'France' },
  { code: 'GB', label: 'United Kingdom' },
]

const TABS = [
  { key: 'oscars', label: '🏆 Oscar Winners' },
  { key: 'country', label: '🌍 By Country' },
  { key: 'christmas', label: '🎄 Christmas' },
  { key: 'halloween', label: '🎃 Halloween' },
  { key: 'valentine', label: "❤️ Valentine's" },
  { key: 'family', label: '👨‍👩‍👧 Family-Friendly' },
]

export default function Collections() {
  const [activeTab, setActiveTab] = useState('oscars')
  const [country, setCountry] = useState('US')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    let promise
    if (activeTab === 'oscars') promise = discoveryService.oscarWinners(20)
    else if (activeTab === 'country') promise = discoveryService.byCountry(country)
    else if (activeTab === 'family') promise = discoveryService.familyFriendly()
    else promise = discoveryService.holiday(activeTab)

    promise.then(setMovies).catch(() => setMovies([])).finally(() => setLoading(false))
  }, [activeTab, country])

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Curated Collections</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Collections</h1>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '24px 0 20px', flexWrap: 'wrap' }}>
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

        {activeTab === 'country' && (
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Select country"
            style={{ marginBottom: 20, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
          >
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        )}

        {loading ? (
          <div className="movie-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 10 }} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <p className="muted">Nothing found for this collection right now.</p>
        ) : (
          <div className="movie-row">
            {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        )}
      </div>
    </div>
  )
}
