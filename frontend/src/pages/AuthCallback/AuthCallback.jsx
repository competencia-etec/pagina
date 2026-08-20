import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { storeToken, getCurrentUser, storeUser, showToast, clearSession, getToken } from '../../services/auth.js'

export default function AuthCallback({ onDone }) {
  const { setUser } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    console.log('[AuthCallback] Token from URL:', token ? token.substring(0, 30) + '...' : 'none')

    if (!token) {
      showToast('No se recibió el token de autenticación.', 'error')
      onDone('login')
      return
    }

    storeToken(token)
    console.log('[AuthCallback] Token stored, localStorage now:', localStorage.getItem('access_token') ? 'yes' : 'no')

    getCurrentUser()
      .then((u) => {
        console.log('[AuthCallback] User fetched:', u.username)
        storeUser(u)
        setUser(u)
        showToast(`Bienvenido, ${u.username}.`, 'success')
        onDone('main')
      })
      .catch((err) => {
        console.error('[AuthCallback] Error:', err)
        clearSession()
        showToast('No se pudo completar el inicio de sesión.', 'error')
        onDone('login')
      })
      .finally(() => {
        window.history.replaceState({}, '', '/')
      })
  }, [])

  return (
    <main className="auth-card" role="main">
      <p className="auth-eyebrow">iniciando sesión</p>
      <h1 className="auth-title">Cargando...</h1>
    </main>
  )
}
