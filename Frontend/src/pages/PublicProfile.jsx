import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { posterUrl } from '../services/movieService'
import { socialService } from '../services/socialService'
import { useAuth } from '../context/AuthContext.jsx'

function ProfileSettings({ profile, onSaved }) {
  const [bio, setBio] = useState(profile.bio || '')
  const [publicProfile, setPublicProfile] = useState(true)
  const [publicWatchlist, setPublicWatchlist] = useState(profile.watchlistPublic)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await socialService.updateBio(bio)
      await socialService.updatePrivacy({ publicProfile, publicWatchlist })
      onSaved()
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return <button className="btn btn-outline" onClick={() => setOpen(true)} style={{ fontSize: 13 }}>Edit Profile</button>
  }

  return (
    <div className="card" style={{ padding: 20, marginTop: 20, maxWidth: 480 }}>
      <div className="field">
        <label>Bio</label>
        <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people what you're into…" />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 10 }}>
        <input type="checkbox" checked={publicWatchlist} onChange={(e) => setPublicWatchlist(e.target.checked)} />
        Share my watchlist publicly
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ fontSize: 13 }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button className="btn btn-outline" onClick={() => setOpen(false)} style={{ fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  )
}

export default function PublicProfile() {
  const { userId } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followBusy, setFollowBusy] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    socialService.getPublicProfile(userId)
      .then((data) => {
        setProfile(data)
        if (data.watchlistPublic) {
          socialService.getPublicWatchlist(userId).then(setWatchlist).catch(() => {})
        }
      })
      .catch((err) => setError(err.response?.data?.message || "This profile isn't available."))
      .finally(() => setLoading(false))
  }

  useEffect(load, [userId])

  const toggleFollow = async () => {
    setFollowBusy(true)
    try {
      if (profile.isFollowedByCurrentUser) {
        await socialService.unfollow(userId)
      } else {
        await socialService.follow(userId)
      }
      load()
    } finally {
      setFollowBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="page container">
        <div className="skeleton" style={{ height: 200, borderRadius: 12, marginTop: 24 }} />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="page container">
        <p className="muted" style={{ marginTop: 24 }}>{error}</p>
      </div>
    )
  }

  const isOwnProfile = user?.id === userId

  return (
    <div className="page">
      <div className="container">
        <div className="card marquee-frame" style={{ padding: 32, marginTop: 32, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 32, flexShrink: 0 }}>
            {profile.profilePictureUrl ? <img src={profile.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.displayName?.[0] || '?')}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 className="display" style={{ fontSize: 30, margin: 0 }}>{profile.displayName}</h1>
            {profile.bio && <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 13 }}>
              <span><strong>{profile.followerCount}</strong> <span className="muted">followers</span></span>
              <span><strong>{profile.followingCount}</strong> <span className="muted">following</span></span>
              <span><strong>{profile.reviewCount}</strong> <span className="muted">reviews</span></span>
              <span><strong>{profile.moviesWatchedCount}</strong> <span className="muted">watched</span></span>
              <span className="eyebrow">🏆 {profile.points} pts</span>
              {profile.currentStreak > 0 && <span className="eyebrow">🔥 {profile.currentStreak} day streak</span>}
            </div>
          </div>
          {isAuthenticated && !isOwnProfile && (
            <button className={profile.isFollowedByCurrentUser ? 'btn btn-outline' : 'btn btn-primary'} onClick={toggleFollow} disabled={followBusy}>
              {profile.isFollowedByCurrentUser ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {profile.badges?.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            {profile.badges.map((b) => (
              <div key={b.id} className="card" title={b.description} style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ fontSize: 18 }}>{b.icon}</span> {b.name}
              </div>
            ))}
          </div>
        )}

        {isOwnProfile && <ProfileSettings profile={profile} onSaved={load} />}

        {profile.watchlistPublic && (
          <section style={{ marginTop: 40 }}>
            <div className="section-heading"><h2>{isOwnProfile ? 'Your' : `${profile.displayName}'s`} Watchlist</h2></div>
            {watchlist.length === 0 ? (
              <p className="muted">Nothing on the watchlist yet.</p>
            ) : (
              <div className="movie-row">
                {watchlist.map((item) => (
                  <Link key={item.id} to={`/movie/${item.movieId}`} className="movie-card">
                    {item.posterPath ? (
                      <img src={posterUrl(item.posterPath)} alt={item.title} loading="lazy" />
                    ) : (
                      <div style={{ aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>No poster</div>
                    )}
                    <div className="movie-card-title">{item.title}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
