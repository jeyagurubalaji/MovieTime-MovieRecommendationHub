import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  const isAdmin = user?.roles?.includes('ADMIN')
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
