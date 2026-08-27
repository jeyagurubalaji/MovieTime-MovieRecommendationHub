import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import Search from './pages/Search.jsx'
import Categories from './pages/Categories.jsx'
import Mood from './pages/Mood.jsx'
import Library from './pages/Library.jsx'
import Stats from './pages/Stats.jsx'
import Community from './pages/Community.jsx'
import PublicProfile from './pages/PublicProfile.jsx'
import Games from './pages/Games.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Collections from './pages/Collections.jsx'
import ReleaseCalendar from './pages/ReleaseCalendar.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import ChatbotWidget from './components/ChatbotWidget.jsx'

export default function App() {
  const { t } = useTranslation()

  return (
    <>
      <a href="#main-content" className="skip-link">{t('skip_to_content')}</a>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/search" element={<Search />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/community" element={<Community />} />
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
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
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
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <ChatbotWidget />
    </>
  )
}
