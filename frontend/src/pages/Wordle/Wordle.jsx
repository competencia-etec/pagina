import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { startWordle, guessWordle, getWordleGame } from '../../services/games.js'
import DebugAuth from '../../components/DebugAuth/DebugAuth.jsx'

export default function Wordle({ onGoHome }) {
  const { isAuthenticated, loading, login } = useAuth()
  const [game, setGame] = useState(null)
  const [guess, setGuess] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login()
    }
  }, [isAuthenticated, loading, login])

  useEffect(() => {
    if (isAuthenticated) {
      startWordle().then(setGame).catch(() => setMessage('Error al iniciar juego'))
    }
  }, [isAuthenticated])

  const handleGuess = async (e) => {
    e.preventDefault()
    if (!game) return
    try {
      const result = await guessWordle(guess)
      setGame(result)
      setGuess('')
      if (result.game_status !== 'in_progress') {
        setMessage(result.game_status === 'won' ? '¡Ganaste!' : `Perdiste. La palabra era...`)
      }
    } catch (err) {
      setMessage('Error al adivinar')
    }
  }

  if (loading || !isAuthenticated) {
    return <div className="auth-card">Cargando...</div>
  }

  return (
    <div>
      <DebugAuth />
      <h1>Wordle</h1>
      <button onClick={onGoHome}>Volver</button>
      {game && (
        <div>
          <p>Intentos: {game.attempts_remaining}</p>
          <p>Palabra: {game.partial_word}</p>
          <form onSubmit={handleGuess}>
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              maxLength={game.word_length}
              placeholder={`Palabra de ${game.word_length} letras`}
            />
            <button type="submit">Adivinar</button>
          </form>
          <p>Intentos previos: {game.prev_attempts?.join(', ')}</p>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  )
}