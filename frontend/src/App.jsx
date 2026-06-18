import { useState } from 'react'
import MainPage from './pages/MainPage/MainPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import Wordle from './pages/Wordle/Wordle'
import Connections from './pages/Connections/Connections'
import './index.css'

function App() {
  const [page, setPage] = useState('main') // 'main' | 'login' | 'register' | 'wordle' | 'connections'
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
        setPage={setPage}
      />
    )
  }

  if (page === 'wordle') {
    return <Wordle onGoHome={() => setPage('main')} />
  }

  if (page === 'connections') {
    return <Connections onGoHome={() => setPage('main')} />
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

