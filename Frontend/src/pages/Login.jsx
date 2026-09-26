import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import PasswordInput from '../components/PasswordInput.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="display">Welcome Back</h1>
        <p className="auth-subtitle" style={{ marginBottom: 24 }}>Sign in to pick up where you left off.</p>

        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <LanguageSwitcher
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 16px',
                color: 'var(--text)',
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter the email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              name="password"
              required
              placeholder="Enter the password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 18 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--gold)' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <GoogleSignInButton onError={setError} />

        <p className="auth-footer-link">
          New to MovieTime? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}