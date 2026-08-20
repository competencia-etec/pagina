import { useAuth } from '../../context/AuthContext.jsx'
import { getToken, isAuthenticated } from '../../services/auth.js'

export default function DebugAuth() {
  const { user, isAuthenticated: ctxAuth, loading } = useAuth()
  const token = getToken()

  if (loading) return <div className="auth-card">Cargando...</div>

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', border: '1px solid #ddd', margin: '16px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h3>Debug Auth State</h3>
      <p>isAuthenticated (context): {String(ctxAuth)}</p>
      <p>isAuthenticated (service): {String(isAuthenticated())}</p>
      <p>User: {user ? JSON.stringify(user) : 'null'}</p>
      <p>Token in localStorage: {token ? token.substring(0, 30) + '...' : 'none'}</p>
    </div>
  )
}