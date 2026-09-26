import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import PasswordInput from '../components/PasswordInput'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await authService.resetPassword(email, otp, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. Check your OTP and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="display">Verify OTP</h1>
        <p className="auth-subtitle">Enter the 6-digit code sent to your email and set your new password.</p>

        {error && <div className="form-error-banner">{error}</div>}

        {done ? (
          <p style={{ color: 'var(--success)', fontSize: 14 }}>Password reset successfully! Redirecting to sign in…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="otp">6-Digit OTP</label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}
              />
            </div>

            <div className="field">
              <label htmlFor="password">New Password</label>
              <PasswordInput
                id="password"
                required
                minLength={8}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Updating…' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer-link">
          <Link to="/forgot-password">Resend Code</Link>
        </p>
      </div>
    </div>
  )
}