import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import NllbTranslate, { restoreNllbTranslateLanguage } from './components/NllbTranslate.jsx'
import TranslationStatus from './components/TranslationStatus.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import PersonDetails from './pages/PersonDetails.jsx'
import Search from './pages/Search.jsx'
import Categories from './pages/Categories.jsx'
import Mood from './pages/Mood.jsx'
import Library from './pages/Library.jsx'
import PublicProfile from './pages/PublicProfile.jsx'
import Games from './pages/Games.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Collections from './pages/Collections.jsx'
import ReleaseCalendar from './pages/ReleaseCalendar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ChatbotWidget from './components/ChatbotWidget.jsx'

export default function App() {
  const location = useLocation()
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

  // Hide Navbar/Chatbot on Auth pages
  const hidePublicUI = authRoutes.includes(location.pathname)

  useEffect(() => {
    const timeout = setTimeout(restoreNllbTranslateLanguage, 400)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      <NllbTranslate />
      <TranslationStatus />
      <a href="#main-content" className="skip-link">Skip to content</a>

      {!hidePublicUI && <Navbar />}

      <main id="main-content">
        <Routes>
          {/* --- PUBLIC APP ROUTES --- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/person/:id" element={<PersonDetails />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/calendar" element={<ReleaseCalendar />} />
          <Route path="/u/:userId" element={<PublicProfile />} />

          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!hidePublicUI && <ChatbotWidget />}
    </>
  )
}