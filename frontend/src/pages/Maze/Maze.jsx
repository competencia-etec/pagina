import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { startMaze, moveMaze, getMazeGame, finishMaze, isSessionAlreadyCreated } from '../../services/games.js'
import noneImg from '../../assets/maze/none.png'
import blockedImg from '../../assets/maze/blocked.png'
import frontImg from '../../assets/maze/front.png'
import leftImg from '../../assets/maze/left.png'
import rightImg from '../../assets/maze/right.png'
import frontLeftImg from '../../assets/maze/front_left.png'
import frontRightImg from '../../assets/maze/front_right.png'
import leftRightImg from '../../assets/maze/left_right.png'
import './Maze.css'

// Facing: 0=Up, 1=Right, 2=Down, 3=Left
const FACING = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 }

export default function Maze({ onGoHome }) {
  const { isAuthenticated, loading, login } = useAuth()
  const [game, setGame] = useState(null)
  const [message, setMessage] = useState('')
  const [facing, setFacing] = useState(FACING.UP)
  const [won, setWon] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login()
    }
  }, [isAuthenticated, loading, login])

  useEffect(() => {
    if (!isAuthenticated) return

    // Guard against React StrictMode double-mount (dev) racing /maze/start/
    let cancelled = false

    const loadGame = async () => {
      const applyInitialFacing = (g) => {
        // Backend: 1=Up, 2=Right, 3=Down, 4=Left -> frontend FACING 0-3
        if (typeof g?.initial_facing === 'number') {
          setFacing(g.initial_facing - 1)
        }
      }
      try {
        const g = await getMazeGame()
        if (!cancelled) {
          setGame(g)
          applyInitialFacing(g)
          if (g.game_status === 'won') setWon(true)
        }
      } catch {
        // No session yet: create one. If it already exists (406), just load it.
        try {
          await startMaze()
        } catch (err) {
          if (!isSessionAlreadyCreated(err)) {
            if (!cancelled) setMessage('Error al iniciar laberinto')
            return
          }
        }
        try {
          const g = await getMazeGame()
          if (!cancelled) {
            setGame(g)
            applyInitialFacing(g)
          }
        } catch {
          if (!cancelled) setMessage('Error al iniciar laberinto')
        }
      }
    }

    loadGame()
    return () => { cancelled = true }
  }, [isAuthenticated])

  const getAbsoluteDirection = (relativeDir) => {
    // relativeDir: 0=forward, 1=right, 2=back, 3=left
    return ((facing + relativeDir) % 4) + 1 // Backend: 1=Up, 2=Right, 3=Down, 4=Left
  }

  const handleMove = async (relativeDir) => {
    if (!game) return
    try {
      const absDir = getAbsoluteDirection(relativeDir)
      await moveMaze(absDir)
      const updated = await getMazeGame()
      setGame(updated)
      if (updated.game_status === 'won') {
        setWon(true)
      }
    } catch (err) {
      setMessage('Error al mover')
    }
  }

  const handleRotate = (delta) => {
    setFacing((prev) => (prev + delta + 4) % 4)
  }

  if (loading || !isAuthenticated) {
    return <div className="auth-card">Cargando...</div>
  }

  const getViewImage = (movements, face) => {
    if (!movements) return blockedImg
    // Backend absolute order: [up(0), down(1), right(2), left(3)]
    // Direction mapping: 1=Up(idx0), 2=Right(idx2), 3=Down(idx1), 4=Left(idx3)
    const dirToIdx = { 1: 0, 2: 2, 3: 1, 4: 3 }
    const frontDir = face + 1
    const rightDir = ((face + 1) % 4) + 1
    const leftDir = ((face + 3) % 4) + 1

    // possible_movements: true = camino abierto en esa dirección.
    const openFront = !!movements[dirToIdx[frontDir]]
    const openRight = !!movements[dirToIdx[rightDir]]
    const openLeft = !!movements[dirToIdx[leftDir]]

    // OJO: los nombres de las imágenes indican dónde hay PAREDES.
    // p.ej. front_left.png = paredes al frente e izquierda (abierto solo a la derecha).
    if (openFront && openLeft && openRight) return noneImg      // sin paredes
    if (openFront && openLeft) return rightImg                  // pared derecha
    if (openFront && openRight) return leftImg                  // pared izquierda
    if (openLeft && openRight) return frontImg                  // pared al frente
    if (openFront) return leftRightImg                          // paredes izq + der
    if (openLeft) return frontRightImg                          // paredes frente + der
    if (openRight) return frontLeftImg                          // paredes frente + izq
    // Nada abierto de frente/lados: estás mirando una pared
    return blockedImg
  }

  if (!game) {
    return <div className="auth-card">Cargando laberinto...</div>
  }

  const viewImage = getViewImage(game.turn_status?.possible_movements, facing)
  const absMoves = game.turn_status?.possible_movements || [false, false, false, false]
  const dirToIdx = { 1: 0, 2: 2, 3: 1, 4: 3 }
  const frontDir = facing + 1
  const rightDir = ((facing + 1) % 4) + 1
  const leftDir = ((facing + 3) % 4) + 1

  // possible_movements: true = camino abierto en esa dirección
  const openFront = !!absMoves[dirToIdx[frontDir]]
  const openRight = !!absMoves[dirToIdx[rightDir]]
  const openLeft = !!absMoves[dirToIdx[leftDir]]

  return (
    <div className="maze-container">
      <h1>Laberinto</h1>
      <button onClick={onGoHome}>Volver</button>
      <div className="maze-view">
        <div className="maze-view-frame">
          <img src={viewImage} alt="Vista del laberinto" className="maze-view-img" />
        </div>
        <div className="maze-info">
          <p>Posición: ({game.player_x}, {game.player_y})</p>
          <p>Estado: {game.game_status}</p>
        </div>
        <div className="maze-controls">
          <button className="maze-btn" onClick={() => handleMove(0)} disabled={!openFront}>↑</button>
          <div className="maze-controls-row">
            <button className="maze-btn maze-btn-icon" onClick={() => handleRotate(-1)}>←</button>
            <button className="maze-btn maze-btn-icon" onClick={() => handleRotate(1)}>→</button>
          </div>
        </div>
        {message && <p className="maze-info">{message}</p>}
      </div>
      {won && (
        <div className="maze-win-overlay">
          <div className="maze-win-modal">
            <h2>Lo lograste :o)</h2>
            <button
              className="maze-btn"
              onClick={() => {
                setWon(false)
                finishMaze().catch(() => {})
                onGoHome()
              }}
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  )
}