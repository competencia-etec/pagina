import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AuthCallback from './pages/AuthCallback/AuthCallback.jsx'
import MainPage from './pages/MainPage/MainPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import Wordle from './pages/Wordle/Wordle'
import Maze from './pages/Maze/Maze'
import './index.css'

function AppContent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth()
  const [page, setPage] = useState('main')
  const [showCallback, setShowCallback] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('token')) {
      setShowCallback(true)
    }
  }, [])

  const handleAuthDone = (nextPage) => {
    setShowCallback(false)
    setPage(nextPage)
  }

  if (showCallback) {
    return <AuthCallback onDone={handleAuthDone} />
  }

  if (loading) {
    return <div className="auth-card">Cargando...</div>
  }

  if (page === 'main') {
    return (
      <MainPage
        onGoLogin={login}
        onGoRegister={login}
        onLogout={logout}
        user={user}
        setPage={setPage}
      />
    )
  }

  if (page === 'wordle') {
    if (!isAuthenticated) {
      return <LoginPage onGoHome={login} onGoRegister={login} />
    }
    return <Wordle onGoHome={() => setPage('main')} />
  }

  if (page === 'maze') {
    if (!isAuthenticated) {
      return <LoginPage onGoHome={login} onGoRegister={login} />
    }
    return <Maze onGoHome={() => setPage('main')} />
  }

  return (
    <div className="app-root">
      {page === 'login' ? (
        <LoginPage onGoRegister={login} onGoHome={login} />
      ) : (
        <RegisterPage onGoLogin={login} onGoHome={login} />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App