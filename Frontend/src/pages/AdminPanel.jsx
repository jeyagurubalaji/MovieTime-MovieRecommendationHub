import { useEffect, useState } from 'react'
import { adminService } from '../services/discoveryService'

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => adminService.getUsers().then(setUsers).finally(() => setLoading(false))
  useEffect(load, [])

  const toggleAdmin = async (u) => {
    const isAdmin = u.roles?.includes('ADMIN')
    await adminService.setAdminRole(u.id, !isAdmin)
    load()
  }

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.displayName}"? This can't be undone.`)) return
    await adminService.deleteUser(u.id)
    load()
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {users.map((u) => (
        <div key={u.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.displayName}</div>
            <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
          </div>
          {u.roles?.includes('ADMIN') && <span className="eyebrow">ADMIN</span>}
          <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => toggleAdmin(u)}>
            {u.roles?.includes('ADMIN') ? 'Revoke Admin' : 'Make Admin'}
          </button>
          <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ticket-red)' }} onClick={() => handleDelete(u)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

function ReviewsTab() {
  const [reviews, setReviews] = useState([])
  const [onlyReported, setOnlyReported] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => adminService.getReviews(onlyReported).then(setReviews).finally(() => setLoading(false))
  useEffect(load, [onlyReported])

  const handleHideToggle = async (r) => {
    await adminService.hideReview(r.id, !r.hidden)
    load()
  }

  const handleDelete = async (r) => {
    if (!confirm('Delete this review permanently?')) return
    await adminService.deleteReview(r.id)
    load()
  }

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 16 }}>
        <input type="checkbox" checked={onlyReported} onChange={(e) => setOnlyReported(e.target.checked)} />
        Only show reported reviews
      </label>

      {loading ? <p className="muted">Loading…</p> : reviews.length === 0 ? (
        <p className="muted">No reviews to moderate.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.userDisplayName} · {r.rating}/10</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {r.reportedByUserIds?.length > 0 && `⚠ ${r.reportedByUserIds.length} reports`} {r.hidden && '· HIDDEN'}
                </span>
              </div>
              <p style={{ fontSize: 13, margin: '0 0 12px' }}>{r.text}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => handleHideToggle(r)}>
                  {r.hidden ? 'Unhide' : 'Hide'}
                </button>
                <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--ticket-red)' }} onClick={() => handleDelete(r)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FeaturedTab() {
  const [featured, setFeatured] = useState([])
  const [movieId, setMovieId] = useState('')
  const [title, setTitle] = useState('')
  const [posterPath, setPosterPath] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => adminService.getFeaturedMovies().then(setFeatured).finally(() => setLoading(false))
  useEffect(load, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!movieId || !title) return
    await adminService.addFeaturedMovie({ id: Number(movieId), title, poster_path: posterPath }, note)
    setMovieId(''); setTitle(''); setPosterPath(''); setNote('')
    load()
  }

  const handleRemove = async (id) => {
    await adminService.removeFeaturedMovie(id)
    load()
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="TMDB movie ID" value={movieId} onChange={(e) => setMovieId(e.target.value)} style={{ width: 130 }} />
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 180 }} />
        <input placeholder="Poster path (/xyz.jpg)" value={posterPath} onChange={(e) => setPosterPath(e.target.value)} style={{ width: 180 }} />
        <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: 180 }} />
        <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }}>Add Featured</button>
      </form>

      {loading ? <p className="muted">Loading…</p> : featured.length === 0 ? (
        <p className="muted">No featured movies yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {featured.map((f) => (
            <div key={f.id} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, fontSize: 13 }}>{f.title} {f.note && <span className="muted">— {f.note}</span>}</div>
              <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => handleRemove(f.movieId)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnalyticsTab() {
  const [data, setData] = useState(null)

  useEffect(() => { adminService.getAnalytics().then(setData) }, [])

  if (!data) return <p className="muted">Loading…</p>

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          ['Total Users', data.totalUsers],
          ['Total Reviews', data.totalReviews],
          ['Movies Watched', data.totalWatched],
          ['Favorites Added', data.totalFavorites],
        ].map(([label, value]) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div className="eyebrow">{label}</div>
            <div className="display" style={{ fontSize: 26, marginTop: 6 }}>{value}</div>
          </div>
        ))}
      </div>

      {data.topGenresPlatformWide?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-heading"><h2>Top Genres Platform-Wide</h2></div>
          {data.topGenresPlatformWide.map(([genre, count]) => (
            <div key={genre} style={{ fontSize: 13, marginBottom: 6 }}>{genre}: <strong>{count}</strong></div>
          ))}
        </div>
      )}

      {Object.keys(data.signupsByDay || {}).length > 0 && (
        <div>
          <div className="section-heading"><h2>Signups by Day</h2></div>
          <div className="muted" style={{ fontSize: 12 }}>
            {Object.entries(data.signupsByDay).map(([day, count]) => `${day}: ${count}`).join(' · ')}
          </div>
        </div>
      )}
    </div>
  )
}

function ApiMonitoringTab() {
  const [data, setData] = useState(null)

  useEffect(() => { adminService.getApiMetrics().then(setData) }, [])

  if (!data) return <p className="muted">Loading…</p>

  const endpoints = Object.entries(data.requestsByEndpoint || {}).sort(([, a], [, b]) => b - a)

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="eyebrow">Total Requests</div>
          <div className="display" style={{ fontSize: 26, marginTop: 6 }}>{data.totalRequests}</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="eyebrow">Total Errors</div>
          <div className="display" style={{ fontSize: 26, marginTop: 6, color: data.totalErrors > 0 ? 'var(--ticket-red)' : 'inherit' }}>{data.totalErrors}</div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12, marginBottom: 16 }}>In-memory counters — resets on server restart.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {endpoints.map(([endpoint, count]) => (
          <div key={endpoint} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{endpoint}</span>
            <span>{count}{data.errorsByEndpoint?.[endpoint] ? ` (${data.errorsByEndpoint[endpoint]} errors)` : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TABS = [
  { key: 'users', label: 'Users', component: UsersTab },
  { key: 'reviews', label: 'Reviews', component: ReviewsTab },
  { key: 'featured', label: 'Featured Movies', component: FeaturedTab },
  { key: 'analytics', label: 'Analytics', component: AnalyticsTab },
  { key: 'monitoring', label: 'API Monitoring', component: ApiMonitoringTab },
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const ActiveComponent = TABS.find((t) => t.key === activeTab).component

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Admin</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Admin Panel</h1>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '24px 0 28px', flexWrap: 'wrap' }}>
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

        <ActiveComponent />
      </div>
    </div>
  )
}
