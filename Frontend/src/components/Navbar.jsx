import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import NotificationBell from './NotificationBell.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import AccessibilityMenu from './AccessibilityMenu.jsx'

export default function Navbar() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.roles?.includes('ADMIN')

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Movie<span>Time</span>
        </Link>

        <nav className="navbar-links" aria-label="Main navigation">
          <Link to="/">{t('nav_home')}</Link>
          <Link to="/search">{t('nav_search')}</Link>
          <Link to="/categories">{t('nav_categories')}</Link>
          <Link to="/collections">{t('nav_collections')}</Link>
          <Link to="/calendar">{t('nav_calendar')}</Link>
          <Link to="/mood">{t('nav_mood')}</Link>
          <Link to="/community">{t('nav_community')}</Link>
          {isAuthenticated && <Link to="/games">{t('nav_games')}</Link>}
          <Link to="/leaderboard">{t('nav_leaderboard')}</Link>
          {isAuthenticated && <Link to="/library">{t('nav_library')}</Link>}
          {isAuthenticated && <Link to="/stats">{t('nav_stats')}</Link>}
          {isAdmin && <Link to="/admin">{t('nav_admin')}</Link>}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageSwitcher />
          <AccessibilityMenu />

          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <>
              <Link to={`/u/${user?.id}`} className="icon-btn" title="Your profile" aria-label="Your profile">
                {user?.displayName?.[0]?.toUpperCase() || '👤'}
              </Link>
              <button className="icon-btn" onClick={() => { logout(); navigate('/') }} title={t('nav_signout')} aria-label={t('nav_signout')} style={{ fontSize: 14 }}>
                ⏻
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              {t('nav_signin')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
