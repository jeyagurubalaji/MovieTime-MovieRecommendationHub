import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { reviewService } from '../services/reviewService'
import { aiService } from '../services/aiService'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

function ReplyForm({ onSubmit, onCancel }) {
  const [text, setText] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        onSubmit(text)
        setText('')
      }}
      style={{ display: 'flex', gap: 8, marginTop: 10 }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        style={{
          flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '8px 10px', color: 'var(--text)', fontSize: 13,
        }}
      />
      <button type="submit" className="btn btn-outline" style={{ padding: '8px 14px' }}>Reply</button>
      <button type="button" className="btn btn-outline" style={{ padding: '8px 14px' }} onClick={onCancel}>Cancel</button>
    </form>
  )
}

function ReviewItem({ review, onChanged }) {
  const { user, isAuthenticated } = useAuth()
  const [replying, setReplying] = useState(false)
  const [reported, setReported] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated) return
    await reviewService.toggleLike(review.id)
    onChanged()
  }

  const handleReply = async (text) => {
    await reviewService.reply(review.id, text)
    setReplying(false)
    onChanged()
  }

  const handleReport = async () => {
    await reviewService.report(review.id)
    setReported(true)
  }

  const handleDelete = async () => {
    await reviewService.remove(review.id)
    onChanged()
  }

  return (
    <div className="card" style={{ padding: 18, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong style={{ fontSize: 14 }}>{review.userDisplayName}</strong>
          <span className="eyebrow" style={{ marginLeft: 10 }}>★ {review.rating}/10</span>
        </div>
        <span className="muted" style={{ fontSize: 12 }}>{timeAgo(review.createdAt)}</span>
      </div>

      {review.spoiler ? (
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--gold)', fontSize: 13 }}>
            Contains spoilers — click to reveal
          </summary>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>{review.text}</p>
        </details>
      ) : (
        <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5 }}>{review.text}</p>
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13 }}>
        <button
          onClick={handleLike}
          className="muted"
          style={{ background: 'none', border: 'none', color: review.likedByCurrentUser ? 'var(--gold)' : 'var(--text-muted)', padding: 0 }}
        >
          👍 {review.likeCount || 0}
        </button>
        {isAuthenticated && (
          <button onClick={() => setReplying((r) => !r)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0 }}>
            Reply
          </button>
        )}
        {isAuthenticated && (
          <button onClick={handleReport} disabled={reported} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0 }}>
            {reported ? 'Reported' : 'Report'}
          </button>
        )}
        {user?.id === review.userId && (
          <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: 'var(--ticket-red)', padding: 0 }}>
            Delete
          </button>
        )}
      </div>

      {replying && <ReplyForm onSubmit={handleReply} onCancel={() => setReplying(false)} />}

      {review.replies?.length > 0 && (
        <div style={{ marginTop: 14, paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
          {review.replies.map((r) => (
            <div key={r.id} style={{ marginBottom: 10 }}>
              <strong style={{ fontSize: 13 }}>{r.userDisplayName}</strong>{' '}
              <span className="muted" style={{ fontSize: 12 }}>{timeAgo(r.createdAt)}</span>
              <p style={{ fontSize: 13, margin: '4px 0 0' }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReviewSection({ movieId }) {
  const { isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(8)
  const [text, setText] = useState('')
  const [spoiler, setSpoiler] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)

  const load = () => {
    reviewService
      .getForMovie(movieId)
      .then((data) => {
        setReviews(data)
        if (data.length > 0) {
          aiService
            .spoilerFreeSummary(data.map((r) => ({ rating: r.rating, text: r.text })))
            .then(setAiSummary)
            .catch(() => setAiSummary(null))
        } else {
          setAiSummary(null)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await reviewService.create(movieId, rating, text, spoiler)
      setText('')
      setShowForm(false)
      load()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ marginTop: 48 }}>
      <div className="section-heading">
        <h2>Reviews {reviews.length > 0 && <span className="muted" style={{ fontSize: 16 }}>({reviews.length})</span>}</h2>
        {isAuthenticated && (
          <button className="btn btn-outline" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {aiSummary && (
        <div className="card" style={{ padding: 20, marginBottom: 24, borderColor: 'var(--gold-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="eyebrow">🤖 Spoiler-Free Summary</span>
            {!aiSummary.ai_powered && (
              <span className="muted" style={{ fontSize: 11 }}>(AI service not configured — showing basic stats)</span>
            )}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{aiSummary.summary}</p>
          {aiSummary.average_rating != null && (
            <p className="muted" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>
              Based on {aiSummary.review_count} review{aiSummary.review_count === 1 ? '' : 's'} · avg {aiSummary.average_rating}/10
            </p>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="field">
            <label>Your rating: {rating}/10</label>
            <input type="range" min="0.5" max="10" step="0.5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="reviewText">Review</label>
            <textarea
              id="reviewText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4,
                padding: '12px 14px', color: 'var(--text)', fontSize: 14, resize: 'vertical',
              }}
              required
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 16 }}>
            <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
            Contains spoilers
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post Review'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="muted">No reviews yet — be the first to share what you thought.</p>
      ) : (
        reviews.map((r) => <ReviewItem key={r.id} review={r} onChanged={load} />)
      )}
    </section>
  )
}
