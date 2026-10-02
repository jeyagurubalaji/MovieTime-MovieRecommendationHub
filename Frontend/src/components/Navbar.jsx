import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import UserProfileMenu from './UserProfileMenu.jsx'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
        <Link to="/" className="navbar-logo" data-no-translate onClick={closeMobileMenu}>
          Movie<span>Time</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links desktop-only" aria-label="Main navigation">
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

        {/* Actions & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <Link to="/login" className="btn btn-primary" onClick={closeMobileMenu}>
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="icon-btn mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
            style={{ display: 'none', fontSize: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav className="mobile-nav-drawer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/" onClick={closeMobileMenu}>Home</Link>
          <Link to="/search" onClick={closeMobileMenu}>Search</Link>
          <Link to="/categories" onClick={closeMobileMenu}>Categories</Link>
          <Link to="/collections" onClick={closeMobileMenu}>Collections</Link>
          <Link to="/calendar" onClick={closeMobileMenu}>Calendar</Link>
          <Link to="/mood" onClick={closeMobileMenu}>Mood</Link>
          {isAuthenticated && <Link to="/games" onClick={closeMobileMenu}>Games</Link>}
          <Link to="/leaderboard" onClick={closeMobileMenu}>Leaderboard</Link>
          {isAuthenticated && <Link to="/library" onClick={closeMobileMenu}>My Library</Link>}
        </nav>
      )}
    </header>
  )
}