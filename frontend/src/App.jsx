import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AuthCallback from './pages/AuthCallback/AuthCallback.jsx'
import MainPage from './pages/MainPage/MainPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import Wordle from './pages/Wordle/Wordle'
import './index.css'

function AppContent() {
  const [page, setPage] = useState('main')
  const { user, isAuthenticated, loading, login, logout } = useAuth()

  // Check for token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('token')) {
      return; // Handled by AuthCallback
    }
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Check if we're on callback page
  const isCallback = window.location.pathname.includes('/auth/callback') || 
                     new URLSearchParams(window.location.search).has('token');
  
  if (isCallback) {
    return <AuthCallback />;
  }

  if (page === 'main') {
    return (
      <MainPage
        onGoLogin={() => setPage('login')}
        onGoRegister={() => setPage('register')}
        onLogout={logout}
        user={user}
        isLoggedIn={isAuthenticated}
        setPage={setPage}
      />
    )
  }

  if (page === 'wordle') {
    return <Wordle onGoHome={() => setPage('main')} isLoggedIn={isAuthenticated} />
  }

  return (
    <div className="app-root">
      {page === 'login' ? (
        <LoginPage
          onGoRegister={() => setPage('register')}
          onGoHome={() => setPage('main')}
          onLogin={login}
        />
      ) : (
        <RegisterPage
          onGoLogin={() => setPage('login')}
          onGoHome={() => setPage('main')}
          onRegister={login}
        />
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
