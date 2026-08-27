import { useEffect, useState } from 'react'
import { statsService } from '../services/socialService'

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="eyebrow">{label}</div>
      <div className="display" style={{ fontSize: 30, marginTop: 8 }}>{value ?? '—'}</div>
    </div>
  )
}

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsService.getMyStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page container">
        <div className="skeleton" style={{ height: 300, borderRadius: 12, marginTop: 24 }} />
      </div>
    )
  }

  const months = Object.entries(stats?.monthlyWatchCounts || {}).sort(([a], [b]) => a.localeCompare(b))
  const maxMonthly = Math.max(1, ...months.map(([, c]) => c))

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Your Numbers</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Statistics Dashboard</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, margin: '28px 0' }}>
          <StatCard label="Movies Watched" value={stats?.moviesWatched} />
          <StatCard label="Favorite Genre" value={stats?.favoriteGenre} />
          <StatCard label="Favorite Actor" value={stats?.favoriteActor} />
          <StatCard label="Favorite Director" value={stats?.favoriteDirector} />
          <StatCard label="Avg. Rating Given" value={stats?.averageRatingGiven != null ? `${stats.averageRatingGiven}/10` : null} />
        </div>

        {stats?.topGenres?.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <div className="section-heading"><h2>Top Genres</h2></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.topGenres.map((g) => (
                <div key={g.genre} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 120, fontSize: 13 }}>{g.genre}</div>
                  <div style={{ flex: 1, background: 'var(--surface-raised)', borderRadius: 4, height: 10 }}>
                    <div style={{ width: `${(g.count / stats.topGenres[0].count) * 100}%`, background: 'var(--gold)', height: '100%', borderRadius: 4 }} />
                  </div>
                  <div className="muted" style={{ fontSize: 12, width: 24, textAlign: 'right' }}>{g.count}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {months.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <div className="section-heading"><h2>Monthly Watch Count</h2></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
              {months.map(([month, count]) => (
                <div key={month} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${(count / maxMonthly) * 120}px`, background: 'var(--gold)', borderRadius: '4px 4px 0 0',
                      minHeight: 4,
                    }}
                    title={`${month}: ${count}`}
                  />
                  <div className="muted" style={{ fontSize: 10, marginTop: 6 }}>{month.slice(5)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {stats?.moviesWatched === 0 && (
          <p className="muted" style={{ marginTop: 20 }}>
            Mark some movies as watched to start building your stats.
          </p>
        )}
      </div>
    </div>
  )
}
