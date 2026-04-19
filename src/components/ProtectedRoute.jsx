import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-mono">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Login nahi hai → login page pe bhejo
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
