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

  const pick = async (mood) => {
    setSelected(mood)
    setLoading(true)
    setResult(null)
    try {
      const data = await aiService.mood(mood)
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

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

        {result && (
          <>
            <div className="card" style={{ padding: '14px 18px', marginBottom: 24, borderColor: 'var(--gold-dim)' }}>
              <p style={{ margin: 0, fontSize: 15 }}>{result.message}</p>
            </div>
            <div className="movie-row">
              {result.results.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
