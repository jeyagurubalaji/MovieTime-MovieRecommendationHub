import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import UserProfileMenu from './UserProfileMenu.jsx'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" data-no-translate onClick={closeMenu}>
          Movie<span>Time</span>
        </Link>

        {/* Desktop Links */}
        <nav className="navbar-links desktop-links" aria-label="Main navigation">
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

        {/* Actions Section */}
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

          {/* Hamburger Menu Icon for Mobile/Tablet */}
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Links */}
      {isOpen && (
        <nav className="mobile-nav-drawer" aria-label="Mobile navigation">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/search" onClick={closeMenu}>Search</Link>
          <Link to="/categories" onClick={closeMenu}>Categories</Link>
          <Link to="/collections" onClick={closeMenu}>Collections</Link>
          <Link to="/calendar" onClick={closeMenu}>Calendar</Link>
          <Link to="/mood" onClick={closeMenu}>Mood</Link>
          {isAuthenticated && <Link to="/games" onClick={closeMenu}>Games</Link>}
          <Link to="/leaderboard" onClick={closeMenu}>Leaderboard</Link>
          {isAuthenticated && <Link to="/library" onClick={closeMenu}>My Library</Link>}
        </nav>
      )}
    </header>
  )
}