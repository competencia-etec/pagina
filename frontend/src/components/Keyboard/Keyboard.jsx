import './Keyboard.css'

export default function Keyboard({ onKeyPress, guesses, results }) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  const getKeyStatus = (key) => {
    let status = ''
    guesses.forEach((guess, rowIdx) => {
      const rowResult = results[rowIdx]
      if (!guess || !rowResult) return
      
      for (let i = 0; i < 5; i++) {
        if (guess[i] === key) {
          const charStatus = rowResult[i]
          if (charStatus === 'correct') {
            status = 'correct'
            return
          } else if (charStatus === 'present') {
            if (status !== 'correct') status = 'present'
          } else if (charStatus === 'absent') {
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
