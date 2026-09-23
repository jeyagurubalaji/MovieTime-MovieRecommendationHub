import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import UserProfileMenu from './UserProfileMenu.jsx'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" data-no-translate>
          Movie<span>Time</span>
        </Link>

        <nav className="navbar-links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/mood">Mood</Link>
          {isAuthenticated && <Link to="/games">Games</Link>}
          <Link to="/leaderboard">Leaderboard</Link>
          {isAuthenticated && <Link to="/library">My Library</Link>}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageSwitcher />

          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <UserProfileMenu />
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}