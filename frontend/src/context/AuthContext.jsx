import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError, getCurrentUser } from '../services/api'
import { clearToken, getToken, saveToken } from '../utils/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(() => !getToken()) // nothing to verify when logged out

  // Verify a stored token with the server on first load.
  useEffect(() => {
    if (!getToken()) return
    let alive = true
    getCurrentUser()
      .then(({ user }) => alive && setUser(user))
      .catch((err) => {
        // Only drop the token if the server rejected it; keep it if the server is merely unreachable.
        if (err instanceof ApiError && err.status === 401) clearToken()
      })
      .finally(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  const signIn = useCallback(({ token, user }, remember = false) => {
    saveToken(token, remember)
    setUser(user)
  }, [])

  const signOut = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// Where each role lands after logging in. The admin dashboard is a later phase.
export const homeFor = (user) => (user?.role === 'owner' || user?.role === 'admin' ? '/owner' : '/find')
