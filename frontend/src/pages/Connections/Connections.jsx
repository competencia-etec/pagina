import { useState } from 'react'
import './Connections.css'

const INITIAL_GROUPS = [
  {
    category: 'Planetas',
    words: ['MARTE', 'VENUS', 'JÚPITER', 'SATURNO'],
    level: 1,
    color: '#f9df6d' // Yellow
  },
  {
    category: 'Piezas de Ajedrez',
    words: ['REY', 'REINA', 'TORRE', 'ALFIL'],
    level: 2,
    color: '#a0c35a' // Green
  },
  {
    category: 'Lenguajes de Programación',
    words: ['PYTHON', 'JAVA', 'RUST', 'SWIFT'],
    level: 3,
    color: '#b0c4ef' // Blue
  },
  {
    category: 'Metales',
    words: ['ORO', 'PLATA', 'HIERRO', 'COBRE'],
    level: 4,
    color: '#ba81c5' // Purple
  }
]

const shuffle = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function Connections({ onGoHome }) {
  const [words, setWords] = useState(() => {
    const allWords = INITIAL_GROUPS.flatMap(g => g.words.map(w => ({ text: w, category: g.category })))
    return shuffle(allWords)
  })
  const [selectedWords, setSelectedWords] = useState([])
  const [completedGroups, setCompletedGroups] = useState([])
  const [attempts, setAttempts] = useState(4)
  const [message, setMessage] = useState('')

  const toggleSelect = (word) => {
    if (completedGroups.some(g => g.words.includes(word.text))) return
    
    if (selectedWords.includes(word.text)) {
      setSelectedWords(selectedWords.filter(w => w !== word.text))
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word.text])
    }
  }

  const handleSubmit = () => {
    if (selectedWords.length !== 4) return

    const group = INITIAL_GROUPS.find(g => 
      selectedWords.every(w => g.words.includes(w))
    )

    if (group) {
      setCompletedGroups([...completedGroups, group])
      setWords(words.filter(w => !selectedWords.includes(w.text)))
      setSelectedWords([])
      setMessage('¡Excelente!')
      setTimeout(() => setMessage(''), 2000)
    } else {
      setAttempts(attempts - 1)
      setMessage('Intentalo de nuevo')
      setTimeout(() => setMessage(''), 2000)
      if (attempts <= 1) {
        setMessage('Game Over')
      }
    }
  }

  const handleShuffle = () => {
    setWords(shuffle(words))
  }

  const deselectAll = () => {
    setSelectedWords([])
  }

  return (
    <div className="connections-container">
      <div className="connections-header">
        <button className="back-btn" onClick={onGoHome}>←</button>
        <h1 className="connections-title">CONNECTIONS</h1>
        <div className="connections-attempts">
          Intentos restantes: {Array.from({ length: attempts }).map((_, i) => (
            <span key={i} className="attempt-dot">●</span>
          ))}
        </div>
      </div>

      <div className="connections-grid">
        {completedGroups.map((group, idx) => (
          <div 
            key={idx} 
            className="completed-group" 
            style={{ backgroundColor: group.color }}
          >
            <h3>{group.category}</h3>
            <p>{group.words.join(', ')}</p>
          </div>
        ))}
        
        {words.map((word, idx) => (
          <button
            key={idx}
            className={`word-card ${selectedWords.includes(word.text) ? 'selected' : ''}`}
            onClick={() => toggleSelect(word)}
          >
            {word.text}
          </button>
        ))}
      </div>

      <div className="connections-message">
        {message}
      </div>

      <div className="connections-actions">
        <button 
          className="action-btn secondary" 
          onClick={handleShuffle}
          disabled={words.length === 0}
        >
          Mezclar
        </button>
        <button 
          className="action-btn secondary" 
          onClick={deselectAll}
          disabled={selectedWords.length === 0}
        >
          Deseleccionar todo
        </button>
        <button 
          className="action-btn primary" 
          onClick={handleSubmit}
          disabled={selectedWords.length !== 4 || attempts === 0}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
