import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { socialService } from '../services/socialService'

export default function Community() {
  const [topReviewers, setTopReviewers] = useState([])
  const [trendingReviews, setTrendingReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([socialService.getTopReviewers(10), socialService.getTrendingReviews(10)])
      .then(([reviewers, reviews]) => {
        setTopReviewers(reviewers)
        setTrendingReviews(reviews)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">MovieTime Community</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>What Everyone's Watching</h1>
        </div>

        {loading ? (
          <p className="muted" style={{ marginTop: 24 }}>Loading…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 32, marginTop: 32, alignItems: 'start' }}>
            <section>
              <div className="section-heading"><h2>Top Reviewers</h2></div>
              {topReviewers.length === 0 ? (
                <p className="muted">No reviewers yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topReviewers.map((r, i) => (
                    <Link key={r.userId} to={`/u/${r.userId}`} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="eyebrow" style={{ width: 20 }}>#{i + 1}</div>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {r.profilePictureUrl ? <img src={r.profilePictureUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.displayName?.[0] || '?')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{r.displayName}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{r.reviewCount} reviews · {r.totalLikesReceived} likes</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="section-heading"><h2>Trending Reviews</h2></div>
              {trendingReviews.length === 0 ? (
                <p className="muted">No reviews yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {trendingReviews.map((r) => (
                    <div key={r.id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Link to={`/u/${r.userId}`} style={{ fontSize: 13, fontWeight: 600 }}>{r.userDisplayName}</Link>
                        <span className="eyebrow">★ {r.rating}/10 · ♥ {r.likeCount}</span>
                      </div>
                      <Link to={`/movie/${r.movieId}`} style={{ fontSize: 13, lineHeight: 1.6 }}>
                        {r.text.length > 200 ? r.text.slice(0, 200) + '…' : r.text}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
