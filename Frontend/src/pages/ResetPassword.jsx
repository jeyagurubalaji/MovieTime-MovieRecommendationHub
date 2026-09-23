import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. The link may have expired.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <h1 className="display">Invalid Link</h1>
          <p className="auth-subtitle">This password reset link is missing its token.</p>
          <Link to="/forgot-password" className="btn btn-primary">Request a new link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="display">Set New Password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>

        {error && <div className="form-error-banner">{error}</div>}

        {done ? (
          <p style={{ color: 'var(--success)', fontSize: 14 }}>Password updated. Redirecting to sign in…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="password">New password</label>
              <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
