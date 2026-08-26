import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { initPushNotifications } from '../services/firebaseMessaging'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('movietime_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('movietime_token')
    if (!token) {
      setLoading(false)
      return
    }
    authService
      .getCurrentUser()
      .then((u) => {
        setUser(u)
        localStorage.setItem('movietime_user', JSON.stringify(u))
      })
      .catch(() => {
        localStorage.removeItem('movietime_token')
        localStorage.removeItem('movietime_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const persistSession = ({ token, user: newUser }) => {
    localStorage.setItem('movietime_token', token)
    localStorage.setItem('movietime_user', JSON.stringify(newUser))
    setUser(newUser)
    initPushNotifications().catch(() => {})
  }

  const login = async (email, password) => {
    const data = await authService.login({ email, password })
    persistSession(data)
    return data
  }

  const register = async (displayName, email, password) => {
    const data = await authService.register({ displayName, email, password })
    persistSession(data)
    return data
  }

  const loginWithGoogle = async (idToken) => {
    const data = await authService.loginWithGoogle(idToken)
    persistSession(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('movietime_token')
    localStorage.removeItem('movietime_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
