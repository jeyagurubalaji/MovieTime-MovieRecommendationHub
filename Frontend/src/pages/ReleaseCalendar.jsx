import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { posterUrl } from '../services/movieService'
import { discoveryService } from '../services/discoveryService'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December']

export default function ReleaseCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    discoveryService.releaseCalendar(year, month).then(setMovies).catch(() => setMovies([])).finally(() => setLoading(false))
  }, [year, month])

  const changeMonth = (delta) => {
    let newMonth = month + delta
    let newYear = year
    if (newMonth > 12) { newMonth = 1; newYear++ }
    if (newMonth < 1) { newMonth = 12; newYear-- }
    setMonth(newMonth)
    setYear(newYear)
  }

  const grouped = movies.reduce((acc, m) => {
    const date = m.release_date || 'Unknown'
    acc[date] = acc[date] || []
    acc[date].push(m)
    return acc
  }, {})

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">What's Coming</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Release Calendar</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0 28px' }}>
          <button className="icon-btn" onClick={() => changeMonth(-1)} aria-label="Previous month">←</button>
          <h2 style={{ margin: 0, fontSize: 20, minWidth: 180, textAlign: 'center' }}>{MONTH_NAMES[month - 1]} {year}</h2>
          <button className="icon-btn" onClick={() => changeMonth(1)} aria-label="Next month">→</button>
        </div>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="muted">No releases found for this month.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateMovies]) => (
              <div key={date}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>{date}</div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {dateMovies.map((m) => (
                    <Link key={m.id} to={`/movie/${m.id}`} style={{ width: 100 }}>
                      {m.poster_path ? (
                        <img src={posterUrl(m.poster_path, 'w185')} alt={m.title} style={{ width: '100%', borderRadius: 8 }} />
                      ) : (
                        <div style={{ width: 100, height: 150, background: 'var(--surface-raised)', borderRadius: 8 }} />
                      )}
                      <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.3 }}>{m.title}</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
