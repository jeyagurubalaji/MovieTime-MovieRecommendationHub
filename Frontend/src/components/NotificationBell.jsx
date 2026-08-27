import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { notificationService } from '../services/notificationService'

const TYPE_ICONS = {
  NEW_RELEASE: '🎬',
  UPCOMING_MOVIE: '📅',
  FAVORITE_ACTOR_NEW_MOVIE: '⭐',
  WATCHLIST_REMINDER: '🔔',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef(null)

  const refreshUnread = () => {
    notificationService.unreadCount().then(setUnreadCount).catch(() => {})
  }

  useEffect(() => {
    refreshUnread()
    const interval = setInterval(refreshUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      notificationService.list().then((data) => {
        setNotifications(data)
        setLoaded(true)
      })
    }
  }

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    refreshUnread()
  }

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={toggleOpen} title="Notifications" aria-label="Notifications" style={{ position: 'relative' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2, background: 'var(--ticket-red)', color: '#fff',
            fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="card" style={{ position: 'absolute', top: 46, right: 0, width: 320, maxHeight: 420, overflowY: 'auto', zIndex: 70 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 12, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="muted" style={{ padding: 16, fontSize: 13 }}>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={n.movieId ? `/movie/${n.movieId}` : '#'}
                onClick={() => { if (!n.read) handleMarkRead(n.id); setOpen(false) }}
                style={{
                  display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'rgba(232,176,75,0.06)',
                }}
              >
                <span style={{ fontSize: 18 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{n.body}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
