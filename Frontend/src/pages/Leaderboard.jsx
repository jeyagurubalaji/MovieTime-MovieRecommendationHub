import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gamificationService } from '../services/notificationService'

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gamificationService.getLeaderboard(20).then(setEntries).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Top Point Earners</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Leaderboard</h1>
        </div>

        {loading ? (
          <p className="muted" style={{ marginTop: 24 }}>Loading…</p>
        ) : entries.length === 0 ? (
          <p className="muted" style={{ marginTop: 24 }}>No one's on the board yet — be the first!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 28, maxWidth: 560 }}>
            {entries.map((e, i) => (
              <Link key={e.userId} to={`/u/${e.userId}`} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="display" style={{ fontSize: 20, width: 32, color: i < 3 ? 'var(--gold)' : 'var(--text-muted)' }}>
                  {i + 1}
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {e.profilePictureUrl ? <img src={e.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (e.displayName?.[0] || '?')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{e.displayName}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {e.badgeCount} badge{e.badgeCount === 1 ? '' : 's'}
                    {e.currentStreak > 0 && ` · 🔥 ${e.currentStreak} day streak`}
                  </div>
                </div>
                <div className="eyebrow" style={{ fontSize: 15 }}>{e.points} pts</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
