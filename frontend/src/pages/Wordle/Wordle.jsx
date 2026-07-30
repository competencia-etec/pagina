import { useState, useEffect } from 'react'
import './Wordle.css'
import Navbar from '../../components/Navbar/Navbar.jsx'
import Keyboard from '../../components/Keyboard/Keyboard.jsx'

// Mock function for backend communication
const checkWordOnBackend = async (word) => {
  // TODO: Implement actual backend call
  // This single call should validate the word and return its status
  
  const VALID_WORDS = ['REACT', 'HELLO', 'WORLD', 'PLANT', 'CLOUD', 'GAMES']
  const SOLUTION = 'REACT'
  
  const upperWord = word.toUpperCase()
  
  // 1. Check if word is valid
  if (!VALID_WORDS.includes(upperWord)) {
    return { isValid: false }
  }

  // 2. If valid, calculate statuses
  const statuses = upperWord.split('').map((char, i) => {
    if (char === SOLUTION[i]) return 'correct'
    if (SOLUTION.includes(char)) return 'present'
    return 'absent'
  })

  return {
    isValid: true,
    statuses,
    isCorrect: upperWord === SOLUTION
  }
}

const MAX_ATTEMPTS = 6

export default function Wordle({ onGoLogin, onGoRegister, onLogout, onGoHome, user }) {
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''))
  const [results, setResults] = useState(Array(MAX_ATTEMPTS).fill(null))
  const [currentGuess, setCurrentGuess] = useState('')
  const [currentRow, setCurrentRow] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')
  const [shakeRow, setShakeRow] = useState(null)
  const [flippedCells, setFlippedCells] = useState([])

  const isLoggedIn = !!user;

  const handleKeyPress = (key) => {
    if (gameOver) return

    if (key === 'ENTER') {
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
      setMessage('')
    } else if (key.length === 1 && /^[A-ZÑ]$/.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => (prev + key).toUpperCase())
        setMessage('')
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      let key = e.key.toUpperCase()
      if (key === 'ENTER') key = 'ENTER'
      if (key === 'BACKSPACE') key = 'BACKSPACE'
      handleKeyPress(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentGuess, gameOver, currentRow])


  const submitGuess = async () => {
    if (currentGuess.length !== 5) return

    const response = await checkWordOnBackend(currentGuess)
    
    if (!response.isValid) {
      setShakeRow(currentRow)
      setTimeout(() => setShakeRow(null), 500)
      setMessage('Palabra inválida')
      return
    }

    const { statuses, isCorrect } = response

    // Animation flip
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            setFlippedCells(prev => [...prev, `${currentRow}-${i}`])
        }, i * 200)
    }

    setTimeout(() => {
        const newGuesses = [...guesses]
        newGuesses[currentRow] = currentGuess
        setGuesses(newGuesses)

        const newResults = [...results]
        newResults[currentRow] = statuses
        setResults(newResults)

        if (isCorrect) {
          setGameOver(true)
          setMessage('¡Ganaste! 🎉')
        } else if (currentRow === MAX_ATTEMPTS - 1) {
          setGameOver(true)
          setMessage(`Perdiste.`)
        } else {
          setCurrentRow(prev => prev + 1)
          setCurrentGuess('')
        }
    }, 1000)
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
              const char = i === currentRow ? currentGuess[j] : guess[j]
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
            <h2>{results[currentRow]?.every(s => s === 'correct') ? '¡Ganaste! 🎉' : 'Juego Terminado'}</h2>
            <p>
              {results[currentRow]?.every(s => s === 'correct')
                ? `¡Felicidades! Adivinaste la palabra en ${currentRow + 1} ${currentRow === 0 ? 'intento' : 'intentos'}.` 
                : `Gracias por jugar.`}
            </p>
            <button className="wordle-modal-button" onClick={onGoHome}>
              Volver a la pantalla principal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
