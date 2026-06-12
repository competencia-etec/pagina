import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './index.css'

function App() {
  const [page, setPage] = useState('login') // 'login' | 'register'

  return (
    <div className="app-root">
      {page === 'login' ? (
        <LoginPage onGoRegister={() => setPage('register')} />
      ) : (
        <RegisterPage onGoLogin={() => setPage('login')} />
      )}
    </div>
  )
}

export default App
