import { useState } from 'react'
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './index.css'

function App() {
  const [page, setPage] = useState('main') // 'main' | 'login' | 'register'
  const [user, setUser] = useState(null) // null or { name: string }

  // Simple handler to mock login for testing the UI states
  const handleSimulateLogin = (name = 'Estudiante ETEC') => {
    setUser({ name })
    setPage('main')
  }

  if (page === 'main') {
    return (
      <MainPage
        onGoLogin={() => setPage('login')}
        onGoRegister={() => setPage('register')}
        onLogout={() => setUser(null)}
        user={user}
      />
    )
  }

  return (
    <div className="app-root">
      {page === 'login' ? (
        <LoginPage
          onGoRegister={() => setPage('register')}
          onGoHome={() => setPage('main')}
          onLoginSimulate={() => handleSimulateLogin()}
        />
      ) : (
        <RegisterPage
          onGoLogin={() => setPage('login')}
          onGoHome={() => setPage('main')}
          onRegisterSimulate={() => handleSimulateLogin()}
        />
      )}
    </div>
  )
}

export default App

