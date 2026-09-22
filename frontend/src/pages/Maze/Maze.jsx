import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { startMaze, moveMaze, getMazeGame, finishMaze, isSessionAlreadyCreated } from '../../services/games.js'
import { showToast } from '../../services/auth.js'
import Navbar from '../../components/Navbar/Navbar.jsx'
import noneImg from '../../assets/maze/none.png'
import blockedImg from '../../assets/maze/blocked.png'
import frontImg from '../../assets/maze/front.png'
import leftImg from '../../assets/maze/left.png'
import rightImg from '../../assets/maze/right.png'
import frontLeftImg from '../../assets/maze/front_left.png'
import frontRightImg from '../../assets/maze/front_right.png'
import leftRightImg from '../../assets/maze/left_right.png'
import Compass from './Compass.jsx'
import MiniMap from './MiniMap.jsx'
import './Maze.css'

// Facing: 0=Up, 1=Right, 2=Down, 3=Left
const FACING = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3 }

export default function Maze({
  onGoLogin, onGoRegister, onLogout, onGoHome, user,
}) {
  const isLoggedIn = !!user
  const { isAuthenticated, loading, login } = useAuth()
  const [game, setGame] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [facing, setFacing] = useState(FACING.UP)
  const [won, setWon] = useState(false)
  const [moves, setMoves] = useState(0)
  const [moving, setMoving] = useState(false)
  const [bump, setBump] = useState(null) // 'front' | 'back' | null
  const [replaying, setReplaying] = useState(false)
  const moveLock = useRef(false)

  const FACING_LABEL = ['Norte', 'Este', 'Sur', 'Oeste']

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
          setLoadError('')
          if (g.game_status === 'won') setWon(true)
        }
      } catch {
        // No session yet: create one. If it already exists (406), just load it.
        try {
          await startMaze()
        } catch (err) {
          if (!isSessionAlreadyCreated(err)) {
            if (!cancelled) setLoadError('No pudimos abrir el laberinto. Revisá tu conexión e intentá de nuevo.')
            return
          }
        }
        try {
          const g = await getMazeGame()
          if (!cancelled) {
            setGame(g)
            applyInitialFacing(g)
            setLoadError('')
          }
        } catch {
          if (!cancelled) setLoadError('No pudimos abrir el laberinto. Revisá tu conexión e intentá de nuevo.')
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

  const flashBump = (side) => {
    setBump(side)
    window.clearTimeout(flashBump._t)
    flashBump._t = window.setTimeout(() => setBump(null), 280)
  }

  const handleMove = async (relativeDir) => {
    if (!game || won || moveLock.current) return
    const absDir = getAbsoluteDirection(relativeDir)
    // Optimistic wall feedback even before the server answers
    const dirToIdxLocal = { 1: 0, 2: 2, 3: 1, 4: 3 }
    const absMovesLocal = game.turn_status?.possible_movements
    if (Array.isArray(absMovesLocal) && !absMovesLocal[dirToIdxLocal[absDir]]) {
      flashBump(relativeDir === 2 ? 'back' : 'front')
      return
    }
    moveLock.current = true
    setMoving(true)
    try {
      const res = await moveMaze(absDir)
      if (res.game_status === 'won') {
        setMoves((m) => m + 1)
        setWon(true)
        return
      }
      if (res.move_valid === false) {
        flashBump(relativeDir === 2 ? 'back' : 'front')
        return
      }
      const updated = await getMazeGame()
      setGame(updated)
      setMoves((m) => m + 1)
    } catch {
      showToast('No pudimos moverte. Intentá de nuevo.', 'error')
    } finally {
      moveLock.current = false
      setMoving(false)
    }
  }

  const handleReplay = async () => {
    if (replaying) return
    setReplaying(true)
    try {
      try { await finishMaze() } catch { /* session may already be closed */ }
      try { await startMaze() } catch (err) {
        if (!isSessionAlreadyCreated(err)) throw err
      }
      const g = await getMazeGame()
      setGame(g)
      if (typeof g?.initial_facing === 'number') setFacing(g.initial_facing - 1)
      setMoves(0)
      setWon(false)
      showToast('Nuevo laberinto listo. ¡A explorar!', 'success')
    } catch {
      showToast('No pudimos crear otro laberinto.', 'error')
    } finally {
      setReplaying(false)
    }
  }

  const handleRotate = (delta) => {
    setFacing((prev) => (prev + delta + 4) % 4)
  }

  // WASD + arrow-key controls: W/S forward-back, A/D rotate (arrows symmetric).
  useEffect(() => {
    if (!game || won) return

    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const k = e.key.length === 1 ? e.key.toUpperCase() : e.key
      const map = {
        ArrowUp: () => handleMove(0),
        W: () => handleMove(0),
        ArrowDown: () => handleMove(2),
        S: () => handleMove(2),
        ArrowLeft: () => handleRotate(-1),
        A: () => handleRotate(-1),
        ArrowRight: () => handleRotate(1),
        D: () => handleRotate(1),
      }
      if (map[k]) {
        e.preventDefault()
        map[k]()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, facing, won])

  if (loading || !isAuthenticated) {
    return (
      <div className="main-page">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={onLogout}
          onGoLogin={onGoLogin}
          onGoRegister={onGoRegister}
          onGoHome={onGoHome}
        />
        <div className="maze-loading" role="status" aria-live="polite">
          <div className="maze-loading-img" />
          <p className="maze-loading-text">Cargando…</p>
        </div>
      </div>
    )
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
    return (
      <div className="main-page">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={onLogout}
          onGoLogin={onGoLogin}
          onGoRegister={onGoRegister}
          onGoHome={onGoHome}
        />
        <div className="maze-loading" role="status" aria-live="polite">
          <div className="maze-loading-img" />
          <p className="maze-loading-text">{loadError || 'Abriendo el laberinto…'}</p>
          {loadError && (
            <button className="maze-btn maze-btn-retry" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          )}
        </div>
      </div>
    )
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
  const openBack = !!absMoves[dirToIdx[((facing + 2) % 4) + 1]]

  const viewAlt = `Vista del laberinto mirando al ${FACING_LABEL[facing].toLowerCase()}: ` +
    `${openFront ? 'abierto al frente' : 'pared al frente'}, ` +
    `${openLeft ? 'abierto a la izquierda' : 'pared a la izquierda'}, ` +
    `${openRight ? 'abierto a la derecha' : 'pared a la derecha'}`

  return (
    <div className="main-page maze-page">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={onLogout}
        onGoLogin={onGoLogin}
        onGoRegister={onGoRegister}
        onGoHome={onGoHome}
        eyebrow="Exploración en primera persona"
        title="Laberinto"
      />
      <div className="maze-view">
        <div className="maze-main">
          <div className={`maze-view-frame${bump ? ` maze-bump-${bump}` : ''}${moving ? ' maze-moving' : ''}`}>
            <img key={viewImage} src={viewImage} alt={viewAlt} className="maze-view-img maze-view-swap" />
          </div>
          <aside className="maze-side maze-hud" aria-label="Instrumentos">
            <div className="maze-hud-cell">
              <p className="maze-side-label">Posición</p>
              <MiniMap
                playerX={game.player_x}
                playerY={game.player_y}
                exitX={game.exit_x}
                exitY={game.exit_y}
                mazeW={game.maze_w}
                mazeH={game.maze_h}
              />
            </div>
            <div className="maze-hud-cell">
              <p className="maze-side-label">Brújula</p>
              <Compass
                playerX={game.player_x}
                playerY={game.player_y}
                exitX={game.exit_x}
                exitY={game.exit_y}
                facing={facing}
                won={won}
              />
            </div>
          </aside>
        </div>
        <div className="maze-info">
          <span className={`maze-badge ${won ? 'maze-badge-win' : ''}`}>
            {won ? '¡Encontraste la salida!' : 'Explorando'}
          </span>
          <button className="maze-btn maze-btn-new" onClick={handleReplay} disabled={replaying}>
            {replaying ? 'Creando…' : '↻ Nuevo laberinto'}
          </button>
        </div>
        <div className="maze-controls">
          <div className="maze-dpad" role="group" aria-label="Controles de movimiento">
            <button
              className={`maze-btn maze-btn-icon maze-dpad-up${openFront ? '' : ' is-blocked'}`}
              onClick={() => handleMove(0)}
              aria-disabled={!openFront}
              aria-label="Avanzar (W o flecha arriba)"
              title={openFront ? 'Avanzar (W)' : 'Pared al frente'}
            >
              ↑<span className="maze-keyhint">W</span>
            </button>
            <div className="maze-dpad-row">
              <button
                className="maze-btn maze-btn-icon maze-dpad-left"
                onClick={() => handleRotate(-1)}
                aria-label="Girar a la izquierda (A o flecha izquierda)"
                title="Girar a la izquierda (A)"
              >
                ↺<span className="maze-keyhint">A</span>
              </button>
              <button
                className={`maze-btn maze-btn-icon maze-dpad-down${openBack ? '' : ' is-blocked'}`}
                onClick={() => handleMove(2)}
                aria-disabled={!openBack}
                aria-label="Retroceder (S o flecha abajo)"
                title={openBack ? 'Retroceder (S)' : 'Pared atrás'}
              >
                ↓<span className="maze-keyhint">S</span>
              </button>
              <button
                className="maze-btn maze-btn-icon maze-dpad-right"
                onClick={() => handleRotate(1)}
                aria-label="Girar a la derecha (D o flecha derecha)"
                title="Girar a la derecha (D)"
              >
                ↻<span className="maze-keyhint">D</span>
              </button>
            </div>
          </div>
          <p className="maze-hint">W A S D o flechas para moverte</p>
        </div>
      </div>
      {won && (
        <div className="maze-win-overlay" role="dialog" aria-modal="true" aria-label="Laberinto completado">
          <div className="maze-win-modal">
            <p className="maze-eyebrow">Laberinto completado</p>
            <h2>¡Encontraste la salida!</h2>
            <p className="maze-win-stats">Lo lograste en {moves} {moves === 1 ? 'paso' : 'pasos'}.</p>
            <div className="maze-win-actions">
              <button className="maze-btn maze-btn-primary" onClick={handleReplay} disabled={replaying}>
                {replaying ? 'Creando…' : 'Jugar de nuevo'}
              </button>
              <button
                className="maze-btn maze-btn-ghost"
                onClick={() => {
                  setWon(false)
                  finishMaze().catch(() => {})
                  onGoHome()
                }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}