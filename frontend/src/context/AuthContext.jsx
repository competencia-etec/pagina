import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  getToken,
  getCurrentUser,
  loginWithGoogle,
  clearSession,
  storeUser,
  getStoredUser,
  showToast,
} from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    getCurrentUser()
      .then((u) => {
        storeUser(u)
        setUser(u)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(() => {
    loginWithGoogle()
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
    showToast('Sesión cerrada.', 'info')
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
