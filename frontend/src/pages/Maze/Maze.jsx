import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { startMaze, moveMaze, getMazeGame } from '../../services/games.js'
import './Maze.css'

export default function Maze({ onGoHome }) {
  const { isAuthenticated, loading, login } = useAuth()
  const [game, setGame] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login()
    }
  }, [isAuthenticated, loading, login])

  useEffect(() => {
    if (isAuthenticated) {
      // Try to get existing game first
      getMazeGame()
        .then(setGame)
        .catch(() => {
          // No existing session, start new one
          startMaze().then(setGame).catch(() => setMessage('Error al iniciar laberinto'))
        })
    }
  }, [isAuthenticated])

  const handleMove = async (direction) => {
    if (!game) return
    try {
      const result = await moveMaze(direction)
      setGame(result)
      if (result.game_status === 'won') {
        setMessage('¡Saliste del laberinto!')
      }
    } catch (err) {
      setMessage('Error al mover')
    }
  }

  if (loading || !isAuthenticated) {
    return <div className="auth-card">Cargando...</div>
  }

  const directions = [
    { key: 'up', label: '↑', dir: 1, can: game?.turn_status?.possible_movements?.[0] },
    { key: 'right', label: '→', dir: 2, can: game?.turn_status?.possible_movements?.[1] },
    { key: 'down', label: '↓', dir: 3, can: game?.turn_status?.possible_movements?.[2] },
    { key: 'left', label: '←', dir: 4, can: game?.turn_status?.possible_movements?.[3] },
  ]

  const renderGrid = () => {
    if (!game?.grid) return null
    const rows = game.grid.split('\n').filter(Boolean)
    return (
      <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${rows[0]?.length || 10}, 24px)` }}>
        {rows.map((row, y) =>
          row.split('').map((cell, x) => {
            let className = 'maze-cell '
            if (cell === '#') className += 'wall'
            else if (cell === ' ') className += 'path'
            else if (cell === 'P') className += 'player'
            else if (cell === 'E') className += 'exit'
            return <div key={`${x}-${y}`} className={className}>{cell === 'P' || cell === 'E' ? cell : ''}</div>
          })
        )}
      </div>
    )
  }

  return (
    <div className="maze-container">
      <h1>Laberinto</h1>
      <button onClick={onGoHome}>Volver</button>
      {game && (
        <div>
          <div className="maze-info">
            <p>Posición: ({game.player_x}, {game.player_y})</p>
            <p>Estado: {game.game_status}</p>
          </div>
          {renderGrid()}
          <div className="maze-controls">
            <button className="maze-btn" onClick={() => handleMove(1)} disabled={!directions[0].can}>↑</button>
            <div className="maze-controls-row">
              <button className="maze-btn" onClick={() => handleMove(4)} disabled={!directions[3].can}>←</button>
              <button className="maze-btn" onClick={() => handleMove(2)} disabled={!directions[1].can}>→</button>
            </div>
            <button className="maze-btn" onClick={() => handleMove(3)} disabled={!directions[2].can}>↓</button>
          </div>
          {message && <p className="maze-info">{message}</p>}
        </div>
      )}
    </div>
  )
}