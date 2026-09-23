import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function UserProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  // Check multiple common property names in case AuthContext maps them differently
  const avatarUrl = user.profilePictureUrl || user.picture || user.avatar

  // Fallback initial in case there is no image
  const initial = (user.displayName?.[0] || user.username?.[0] || user.name?.[0] || '?').toUpperCase()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Link
        to={`/u/${user.id}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
        title="View Profile"
      >
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-raised)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 'bold'
        }}>
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer" /* CRITICAL: Prevents Google 403 errors */
            />
          ) : (
            initial
          )}
        </div>
      </Link>

      <button onClick={handleLogout} className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }}>
        Log Out
      </button>
    </div>
  )
}