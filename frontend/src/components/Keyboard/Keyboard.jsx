import './Keyboard.css'

export default function Keyboard({ onKeyPress, guesses, solution }) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  const getKeyStatus = (key) => {
    let status = ''
    guesses.forEach(guess => {
      if (!guess) return
      for (let i = 0; i < 5; i++) {
        const char = guess[i]
        if (char === key) {
          if (solution[i] === char) {
            status = 'correct'
            return // Best status found
          } else if (solution.includes(char)) {
            if (status !== 'correct') status = 'present'
          } else {
            if (status !== 'correct' && status !== 'present') status = 'absent'
          }
        }
      }
    })
    return status
  }

  return (
    <div className="keyboard">
      {rows.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map(key => (
            <button 
              key={key} 
              className={`key ${getKeyStatus(key)}`} 
              onClick={() => onKeyPress(key)}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
