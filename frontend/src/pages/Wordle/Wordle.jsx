import { useState, useEffect } from 'react'
import './Wordle.css'
import Navbar from '../../components/Navbar/Navbar.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Keyboard from '../../components/Keyboard/Keyboard.jsx'

const SOLUTION = 'REACT'
const VALID_WORDS = ['REACT', 'HELLO', 'WORLD', 'PLANT', 'CLOUD', 'GAMES']
const MAX_ATTEMPTS = 6

export default function Wordle({ onGoLogin, onGoRegister, onLogout, onGoHome, user }) {
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''))
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
    } else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
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

  const isValidWord = (word) => {
    return VALID_WORDS.includes(word.toUpperCase())
  }

  const submitGuess = async () => {
    if (currentGuess.length !== 5) return

    if (!isValidWord(currentGuess)) {
      setShakeRow(currentRow)
      setTimeout(() => setShakeRow(null), 500)
      setMessage('Palabra inválida')
      return
    }

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

        if (currentGuess === SOLUTION) {
          setGameOver(true)
          setMessage('¡Ganaste! 🎉')
        } else if (currentRow === MAX_ATTEMPTS - 1) {
          setGameOver(true)
          setMessage(`Perdiste. La palabra era ${SOLUTION}`)
        } else {
          setCurrentRow(prev => prev + 1)
          setCurrentGuess('')
        }
    }, 1000)
  }

  const getCellClass = (char, index, rowIdx) => {
    const isFlipped = flippedCells.includes(`${rowIdx}-${index}`)
    if (isFlipped) {
      if (char === SOLUTION[index]) return 'correct flipped'
      if (SOLUTION.includes(char)) return 'present flipped'
      return 'absent flipped'
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
          <Keyboard onKeyPress={handleKeyPress} guesses={guesses.filter(g => g !== '')} solution={SOLUTION} />
        </div>
      </div>

      {gameOver && (
        <div className="wordle-modal-overlay">
          <div className="wordle-modal">
            <h2>{currentGuess === SOLUTION ? '¡Ganaste! 🎉' : 'Juego Terminado'}</h2>
            <p>
              {currentGuess === SOLUTION 
                ? `¡Felicidades! Adivinaste la palabra en ${currentRow + 1} ${currentRow === 0 ? 'intento' : 'intentos'}.` 
                : `La palabra era: ${SOLUTION}`}
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
