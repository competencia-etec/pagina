import { useState, useEffect, useRef, useCallback } from 'react'
import './Wordle.css'
import Navbar from '../../components/Navbar/Navbar.jsx'
import Keyboard from '../../components/Keyboard/Keyboard.jsx'
import {
  startWordle,
  guessWordle,
  getWordleGame,
  isSessionAlreadyCreated,
} from '../../services/games.js'
import { useAuth } from '../../context/AuthContext.jsx'

const MAX_ATTEMPTS = 6

function computeRowStatuses(guess, partialWord, hints, isWinningRow = false) {
  if (isWinningRow) {
    return Array(5).fill('correct')
  }

  const upperGuess = (guess || '').toUpperCase()
  const upperPartial = typeof partialWord === 'string' ? partialWord.toUpperCase() : ''
  const upperHints = Array.isArray(hints) ? hints.map((h) => String(h).toUpperCase()) : []

  return Array.from({ length: 5 }, (_, i) => {
    const char = upperGuess[i] || ''
    if (upperPartial[i] && upperPartial[i] === char) {
      return 'correct'
    }
    if (char && upperHints.includes(char)) {
      return 'present'
    }
    return 'absent'
  })
}

export default function Wordle({ onGoLogin, onGoRegister, onLogout, onGoHome, user }) {
  const { isAuthenticated, loading, login } = useAuth()
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''))
  const [results, setResults] = useState(Array(MAX_ATTEMPTS).fill(null))
  const [currentGuess, setCurrentGuess] = useState('')
  const [currentRow, setCurrentRow] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState('')
  const [shakeRow, setShakeRow] = useState(null)
  const [flippedCells, setFlippedCells] = useState([])
  const [loadingGame, setLoadingGame] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [replaying, setReplaying] = useState(false)

  const submittingRef = useRef(false)
  const timersRef = useRef([])

  const isLoggedIn = !!user || isAuthenticated

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login()
    }
  }, [isAuthenticated, loading, login])

  const hydrateFromSession = useCallback((session) => {
    const prev = Array.isArray(session?.prev_attempts) ? session.prev_attempts : []
    const partialWord = typeof session?.partial_word === 'string' ? session.partial_word : '?????'
    const hints = Array.isArray(session?.hints) ? session.hints : []

    const isWon =
      session?.game_status === 'won' ||
      (prev.length > 0 &&
        partialWord.length === 5 &&
        !partialWord.includes('?') &&
        String(prev[prev.length - 1]).toUpperCase() === partialWord.toUpperCase())
    const isLost =
      !isWon &&
      (session?.game_status === 'lost' ||
        session?.attempts_remaining === 0 ||
        prev.length >= MAX_ATTEMPTS)

    const newGuesses = Array(MAX_ATTEMPTS).fill('')
    const newResults = Array(MAX_ATTEMPTS).fill(null)
    const newFlipped = []

    const count = Math.min(prev.length, MAX_ATTEMPTS)
    for (let r = 0; r < count; r++) {
      const word = String(prev[r]).toUpperCase()
      newGuesses[r] = word
      const isWinningRow = isWon && r === count - 1
      newResults[r] = computeRowStatuses(word, partialWord, hints, isWinningRow)
      for (let c = 0; c < 5; c++) {
        newFlipped.push(`${r}-${c}`)
      }
    }

    setGuesses(newGuesses)
    setResults(newResults)
    setFlippedCells(newFlipped)
    setCurrentGuess('')
    setShakeRow(null)

    if (isWon) {
      setCurrentRow(Math.max(0, count - 1))
      setGameOver(true)
      setWon(true)
      setMessage('¡Ganaste! 🎉')
    } else if (isLost) {
      setCurrentRow(Math.max(0, count - 1))
      setGameOver(true)
      setWon(false)
      setMessage('Perdiste.')
    } else {
      setCurrentRow(count)
      setGameOver(false)
      setWon(false)
      setMessage('')
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    // Guard against React StrictMode double-mount (dev) racing /wordle/start/
    let cancelled = false

    const loadGame = async () => {
      let session
      try {
        session = await getWordleGame()
      } catch {
        try {
          await startWordle()
        } catch (err) {
          if (!isSessionAlreadyCreated(err)) {
            if (!cancelled) {
              setLoadError('No pudimos iniciar el Wordle. Revisá tu conexión e intentá de nuevo.')
              setMessage('No pudimos iniciar el Wordle. Revisá tu conexión e intentá de nuevo.')
              setLoadingGame(false)
            }
            return
          }
        }

        try {
          session = await getWordleGame()
        } catch {
          if (!cancelled) {
            setLoadError('No pudimos cargar el Wordle. Revisá tu conexión e intentá de nuevo.')
            setMessage('No pudimos cargar el Wordle. Revisá tu conexión e intentá de nuevo.')
            setLoadingGame(false)
          }
          return
        }
      }

      if (!cancelled && session) {
        hydrateFromSession(session)
        setLoadError('')
        setLoadingGame(false)
      }
    }

    loadGame()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, hydrateFromSession])

  const submitGuess = useCallback(async () => {
    if (
      currentGuess.length !== 5 ||
      gameOver ||
      loadingGame ||
      loadError ||
      replaying ||
      submittingRef.current
    ) {
      return
    }

    submittingRef.current = true
    const submittedRow = currentRow
    const submittedGuess = currentGuess.toUpperCase()

    let res
    try {
      res = await guessWordle(submittedGuess.toLowerCase())
    } catch (err) {
      const isInvalidWord =
        err instanceof Error && /invalid guess|406|not acceptable/i.test(err.message)
      if (isInvalidWord) {
        setShakeRow(submittedRow)
        const shakeTimer = window.setTimeout(() => setShakeRow(null), 500)
        timersRef.current.push(shakeTimer)
        setMessage('Palabra inválida')
      } else {
        setMessage('Error de conexión. Intentá de nuevo.')
      }
      submittingRef.current = false
      return
    }

    const isWon = res.game_status === 'won'
    const isLost = res.game_status === 'lost'

    const nextGuesses = [...guesses]
    nextGuesses[submittedRow] = submittedGuess

    const nextResults = [...results]
    nextResults[submittedRow] = computeRowStatuses(
      submittedGuess,
      res.partial_word,
      res.hints,
      isWon
    )

    setGuesses(nextGuesses)
    setResults(nextResults)

    // Animation flip
    for (let i = 0; i < 5; i++) {
      const flipTimer = window.setTimeout(() => {
        const cellKey = `${submittedRow}-${i}`
        setFlippedCells((prev) => (prev.includes(cellKey) ? prev : [...prev, cellKey]))
      }, i * 200)
      timersRef.current.push(flipTimer)
    }

    const finishTimer = window.setTimeout(() => {
      if (isWon) {
        setGameOver(true)
        setWon(true)
        setMessage('¡Ganaste! 🎉')
      } else if (isLost) {
        setGameOver(true)
        setWon(false)
        setMessage('Perdiste.')
      } else {
        setCurrentRow(submittedRow + 1)
        setCurrentGuess('')
      }
      submittingRef.current = false
    }, 1000)
    timersRef.current.push(finishTimer)
  }, [currentGuess, currentRow, gameOver, loadingGame, loadError, replaying, guesses, results])

  const handleKeyPress = useCallback(
    (key) => {
      if (gameOver || loadingGame || loadError || replaying || submittingRef.current) return

      if (key === 'ENTER') {
        submitGuess()
      } else if (key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1))
        setMessage('')
      } else if (key.length === 1 && /^[A-ZÑ]$/.test(key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess((prev) => (prev + key).toUpperCase())
          setMessage('')
        }
      }
    },
    [gameOver, loadingGame, loadError, replaying, currentGuess.length, submitGuess]
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (!gameOver && !loadingGame && !loadError && !replaying && e.key === 'Enter' && e.target?.closest?.('.keyboard')) {
        e.preventDefault()
      }
      let key = e.key.toUpperCase()
      if (key === 'ENTER') key = 'ENTER'
      if (key === 'BACKSPACE') key = 'BACKSPACE'
      handleKeyPress(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress, gameOver, loadingGame, loadError, replaying])

  const handleReplay = async () => {
    if (replaying) return
    setReplaying(true)
    clearTimers()
    submittingRef.current = false
    setMessage('')
    setFlippedCells([])
    try {
      try {
        await startWordle()
      } catch (err) {
        if (!isSessionAlreadyCreated(err)) throw err
      }
      const session = await getWordleGame()
      hydrateFromSession(session)
      setLoadError('')
    } catch {
      setMessage('No pudimos iniciar una nueva partida.')
    } finally {
      setReplaying(false)
    }
  }

  const getCellClass = (char, index, rowIdx) => {
    const isFlipped = flippedCells.includes(`${rowIdx}-${index}`)
    const rowResult = results[rowIdx]

    if (isFlipped && rowResult) {
      return `${rowResult[index]} flipped`
    }
    if (char) return 'unevaluated'
    return ''
  }

  const renderGrid = () => {
    return (
      <div className="wordle-grid">
        {guesses.map((guess, i) => (
          <div key={i} className={`wordle-row ${shakeRow === i ? 'shake' : ''}`}>
            {Array(5).fill('').map((_, j) => {
              const char = i === currentRow && !gameOver ? currentGuess[j] : guess[j]
              return (
                <div key={j} className={`wordle-cell ${getCellClass(char, j, i)}`}>
                  {char}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="main-page" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={onLogout}
        onGoLogin={onGoLogin}
        onGoRegister={onGoRegister}
        onGoHome={onGoHome}
      />

      <div className="wordle-container">
        <header style={{ textAlign: 'center', flexShrink: 0 }}>
            <h2 className="auth-title" style={{marginBottom: "0px"}}>Wordle</h2>
            <button className="auth-footer" style={{ border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={onGoHome}>
                ← Volver al inicio
            </button>
        </header>

        <p className={`wordle-message ${message ? '' : 'hidden'}`} style={{ flexShrink: 0 }}>
          {message || '\u00A0'}
        </p>

        {renderGrid()}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
          <Keyboard onKeyPress={handleKeyPress} guesses={guesses} results={results} />
        </div>
      </div>

      {gameOver && (
        <div className="wordle-modal-overlay">
          <div className="wordle-modal">
            <h2>{won ? '¡Ganaste! 🎉' : 'Juego Terminado'}</h2>
            <p>
              {won
                ? `¡Felicidades! Adivinaste la palabra en ${currentRow + 1} ${currentRow === 0 ? 'intento' : 'intentos'}.`
                : `Gracias por jugar.`}
            </p>
            <button className="wordle-modal-button" onClick={handleReplay} disabled={replaying}>
              {replaying ? 'Cargando...' : 'Jugar de nuevo'}
            </button>
            <button className="wordle-modal-button" onClick={onGoHome}>
              Volver a la pantalla principal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
