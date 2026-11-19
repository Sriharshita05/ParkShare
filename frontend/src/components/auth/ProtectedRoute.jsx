import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// roles is optional, e.g. <ProtectedRoute roles={['driver', 'owner']}>
export default function ProtectedRoute({ children, roles }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  // Still verifying a saved login: don't redirect yet.
  if (!ready) {
    return <div className="grid min-h-[50vh] place-items-center text-slate-500">Loading…</div>
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}