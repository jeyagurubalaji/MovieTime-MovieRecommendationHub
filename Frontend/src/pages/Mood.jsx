import { useState } from 'react'
import MovieCard from '../components/MovieCard.jsx'
import { aiService } from '../services/aiService'

const MOODS = [
  { key: 'happy', label: 'Happy', emoji: '😄' },
  { key: 'sad', label: 'Sad', emoji: '😢' },
  { key: 'excited', label: 'Excited', emoji: '🤩' },
  { key: 'relaxed', label: 'Relaxed', emoji: '😌' },
  { key: 'scared', label: 'Up for a Scare', emoji: '😱' },
  { key: 'romantic', label: 'Romantic', emoji: '🥰' },
  { key: 'nostalgic', label: 'Nostalgic', emoji: '🌅' },
  { key: 'thoughtful', label: 'Thoughtful', emoji: '🤔' },
]

export default function Mood() {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pick = async (mood) => {
    setSelected(mood)
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const data = await aiService.mood(mood)
      if (data && Array.isArray(data.results)) {
        setResult(data)
      } else {
        setResult({ results: [] })
      }
    } catch (err) {
      setError('Unable to load picks for this mood. Please try again.')
      setResult({ results: [] })
    } finally {
      setLoading(false)
    }
  }

  const moviesList = Array.isArray(result?.results) ? result.results : []

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Mood-Based Picks</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>How are you feeling?</h1>
          <p className="muted" style={{ marginTop: 8 }}>Pick a mood and we'll match the watch to it.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '28px 0 36px' }}>
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => pick(m.key)}
              className={selected === m.key ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ fontSize: 14, padding: '12px 20px' }}
            >
              <span style={{ marginRight: 8 }}>{m.emoji}</span>{m.label}
            </button>
          ))}
        </div>

        {loading && <p className="muted">Finding picks for that mood…</p>}
        {error && <p style={{ color: 'var(--ticket-red)', fontSize: 14 }}>{error}</p>}

        {result && !loading && (
          <>
            {result.message && (
              <p style={{ fontSize: 16, marginBottom: 20, color: 'var(--gold)' }}>
                {result.message}
              </p>
            )}
            {moviesList.length > 0 ? (
              <div className="movie-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
                {moviesList.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            ) : (
              <p className="muted">No titles found for this mood.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}