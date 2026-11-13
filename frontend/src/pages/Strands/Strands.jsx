import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  attemptStrands,
  getStrandsGame,
  getStrandsHint,
  isSessionAlreadyCreated,
  startStrands,
} from '../../services/games.js'
import { showToast } from '../../services/auth.js'
import Navbar from '../../components/Navbar/Navbar.jsx'
import './Strands.css'

export default function Strands({ onGoLogin, onGoRegister, onGoHome, onLogout, user }) {
  const isLoggedIn = !!user
  const { isAuthenticated, loading: authLoading, login } = useAuth()

  const [grid, setGrid] = useState([])
  const [theme, setTheme] = useState('')
  const [spangram, setSpangram] = useState('')
  const [totalWords, setTotalWords] = useState(0)
  const [foundWords, setFoundWords] = useState([])
  const [foundCells, setFoundCells] = useState([])
  const [foundSpangram, setFoundSpangram] = useState(false)
  const [foundPaths, setFoundPaths] = useState([])
  const [bonusWordsCount, setBonusWordsCount] = useState(0)
  const [hintCounter, setHintCounter] = useState(0)
  const [hintCells, setHintCells] = useState([])
  const [gameStatus, setGameStatus] = useState('in_progress')
  const [loadError, setLoadError] = useState('')
  const [loadTrigger, setLoadTrigger] = useState(0)
  const [hintLoading, setHintLoading] = useState(false)
  const [replaying, setReplaying] = useState(false)

  const [selectedCells, setSelectedCells] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [cellCenters, setCellCenters] = useState({})

  const gridRef = useRef(null)
  const submittingRef = useRef(false)
  const dragMovedRef = useRef(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      login()
    }
  }, [isAuthenticated, authLoading, login])

  const applySessionData = useCallback((data) => {
    const normalizedGrid = (data.grid || []).map((row) =>
      (Array.isArray(row) ? row : String(row).split('')).map((ch) => String(ch).toUpperCase())
    )
    const normalizedSpangram = (data.spangram || '').toUpperCase()
    const normalizedFoundWords = (data.found_words || []).map((w) => String(w).toUpperCase())
    const normalizedPaths = (data.found_paths || []).map((path) =>
      path.map(([r, c]) => ({ r, c }))
    )

    setGrid(normalizedGrid)
    setTheme(data.theme || '')
    setSpangram(normalizedSpangram)
    setTotalWords(data.total_words ?? 0)
    setFoundWords(normalizedFoundWords)
    setFoundPaths(normalizedPaths)
    setFoundCells(normalizedPaths.flat())
    setFoundSpangram(
      Boolean(normalizedSpangram && normalizedFoundWords.includes(normalizedSpangram))
    )
    setBonusWordsCount(data.bonus_words_count ?? 0)
    setHintCounter(data.hint_counter ?? 0)
    setGameStatus(data.game_status || 'in_progress')
    setHintCells([])
    setSelectedCells([])
    setLoadError('')
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    // Guard against React StrictMode double-mount racing /strands/start/
    let cancelled = false

    const loadSession = async () => {
      try {
        const data = await getStrandsGame()
        if (!cancelled) applySessionData(data)
        return
      } catch {
        // No session yet: create one. If it already exists (406), just load it.
        try {
          await startStrands()
        } catch (err) {
          if (!isSessionAlreadyCreated(err)) {
            if (!cancelled) {
              setLoadError('No pudimos abrir Strands. Revisá tu conexión e intentá de nuevo.')
            }
            return
          }
        }
        try {
          const data = await getStrandsGame()
          if (!cancelled) applySessionData(data)
        } catch {
          if (!cancelled) {
            setLoadError('No pudimos abrir Strands. Revisá tu conexión e intentá de nuevo.')
          }
        }
      }
    }

    loadSession()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, loadTrigger, applySessionData])

  const measureCellCenters = useCallback(() => {
    const gridEl = gridRef.current
    if (!gridEl) return
    const gridRect = gridEl.getBoundingClientRect()
    const cells = gridEl.querySelectorAll('[data-row][data-col]')
    const next = {}
    cells.forEach((cell) => {
      const r = cell.getAttribute('data-row')
      const c = cell.getAttribute('data-col')
      const rect = cell.getBoundingClientRect()
      next[`${r}-${c}`] = {
        x: rect.left - gridRect.left + rect.width / 2,
        y: rect.top - gridRect.top + rect.height / 2,
      }
    })
    setCellCenters(next)
  }, [])

  useEffect(() => {
    const gridEl = gridRef.current
    if (!gridEl || grid.length === 0) return

    const rafId = requestAnimationFrame(measureCellCenters)
    window.addEventListener('resize', measureCellCenters)

    let observer
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measureCellCenters)
      observer.observe(gridEl)
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', measureCellCenters)
      if (observer) observer.disconnect()
    }
  }, [grid, measureCellCenters])

  const getCellCenter = (r, c) => cellCenters[`${r}-${c}`] || null

  const getPathWord = (path) =>
    path.map((cell) => grid[cell.r]?.[cell.c] || '').join('').toUpperCase()

  const isCellFound = (r, c) => foundCells.some((cell) => cell.r === r && cell.c === c)

  const isCellSpangram = (r, c) => {
    if (!foundSpangram || !spangram) return false
    const spangramPath = foundPaths.find((path) => getPathWord(path) === spangram)
    return spangramPath ? spangramPath.some((cell) => cell.r === r && cell.c === c) : false
  }

  const isCellSelected = (r, c) => selectedCells.some((cell) => cell.r === r && cell.c === c)

  const isCellHinted = (r, c) =>
    !isCellFound(r, c) && hintCells.some((cell) => cell.r === r && cell.c === c)

  const getCellAtPos = (x, y) => {
    const element = document.elementFromPoint(x, y)?.closest?.('[data-row][data-col]')
    if (!element) return null
    const r = element.getAttribute('data-row')
    const c = element.getAttribute('data-col')
    if (r !== null && c !== null) {
      return { r: parseInt(r, 10), c: parseInt(c, 10) }
    }
    return null
  }

  const isAdjacent = (cell1, cell2) => {
    const dr = Math.abs(cell1.r - cell2.r)
    const dc = Math.abs(cell1.c - cell2.c)
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0)
  }

  const submitAttempt = useCallback(
    async (cells) => {
      if (submittingRef.current || gameStatus === 'won' || cells.length <= 1) return
      submittingRef.current = true
      const coords = cells.map((cell) => [cell.r, cell.c])

      try {
        const res = await attemptStrands(coords)
        if (res.valid && res.is_game_word) {
          const upperWord = (res.word || '').toUpperCase()
          const nextFoundWords = (res.found_words || []).map((w) => String(w).toUpperCase())
          const isSpangramWord = Boolean(
            res.is_spangram || (spangram && upperWord === spangram)
          )

          setFoundWords(nextFoundWords)
          setFoundPaths((prev) => [...prev, [...cells]])
          setFoundCells((prev) => [...prev, ...cells])
          setGameStatus(res.game_status || 'in_progress')
          setBonusWordsCount(res.bonus_words_count ?? 0)
          setHintCounter(res.hint_counter ?? 0)
          if (isSpangramWord) setFoundSpangram(true)

          setHintCells((prev) => {
            if (prev.length === 0) return prev
            const matchedHint = prev.some((hc) =>
              cells.some((sc) => sc.r === hc.r && sc.c === hc.c)
            )
            return matchedHint ? [] : prev
          })

          showToast(
            isSpangramWord
              ? `¡Spangram! ${upperWord}`
              : `¡Palabra encontrada: ${upperWord}!`,
            'success'
          )
        } else if (res.valid && res.is_bonus) {
          setBonusWordsCount(res.bonus_words_count ?? 0)
          setHintCounter(res.hint_counter ?? 0)
          showToast(`Palabra extra: ${(res.word || '').toUpperCase()}`, 'info')
        }
      } catch {
        showToast('No pudimos verificar la palabra. Intentá de nuevo.', 'error')
      } finally {
        submittingRef.current = false
        setSelectedCells([])
      }
    },
    [gameStatus, spangram]
  )

  const handleStart = (r, c) => {
    if (gameStatus === 'won' || submittingRef.current || isCellFound(r, c)) return

    const lastSelected = selectedCells[selectedCells.length - 1]
    const isLastSelected = lastSelected && lastSelected.r === r && lastSelected.c === c

    if (isLastSelected && selectedCells.length > 1) {
      dragMovedRef.current = false
      setIsDragging(false)
      submitAttempt(selectedCells)
      return
    }

    const existingIndex = selectedCells.findIndex((sc) => sc.r === r && sc.c === c)
    if (existingIndex !== -1 && existingIndex === selectedCells.length - 2) {
      dragMovedRef.current = false
      setSelectedCells(selectedCells.slice(0, -1))
      setIsDragging(true)
      return
    }

    if (existingIndex !== -1) {
      dragMovedRef.current = false
      setSelectedCells([{ r, c }])
      setIsDragging(true)
      return
    }

    dragMovedRef.current = false
    setIsDragging(true)
    if (selectedCells.length === 0) {
      setSelectedCells([{ r, c }])
    } else {
      const lastCell = selectedCells[selectedCells.length - 1]
      if (isAdjacent(lastCell, { r, c })) {
        setSelectedCells([...selectedCells, { r, c }])
      } else {
        setSelectedCells([{ r, c }])
      }
    }
  }

  const handleMove = (e) => {
    if (!isDragging || gameStatus === 'won' || submittingRef.current) return
    const touch = e.touches ? e.touches[0] : e
    if (!touch) return
    const cell = getCellAtPos(touch.clientX, touch.clientY)
    if (!cell || isCellFound(cell.r, cell.c)) return
    const lastCell = selectedCells[selectedCells.length - 1]
    if (!lastCell) return
    if (cell.r === lastCell.r && cell.c === lastCell.c) return

    const existingIndex = selectedCells.findIndex((sc) => sc.r === cell.r && sc.c === cell.c)
    if (existingIndex !== -1 && existingIndex === selectedCells.length - 2) {
      dragMovedRef.current = true
      setSelectedCells(selectedCells.slice(0, -1))
    } else if (existingIndex === -1 && isAdjacent(lastCell, cell)) {
      dragMovedRef.current = true
      setSelectedCells([...selectedCells, cell])
    }
  }

  const handleEnd = useCallback(
    (e) => {
      const didDragMove = dragMovedRef.current
      dragMovedRef.current = false
      setIsDragging(false)

      if (selectedCells.length === 0 || submittingRef.current) return

      if (selectedCells.length > 1) {
        if (didDragMove) {
          submitAttempt(selectedCells)
        } else {
          const touch = e.changedTouches ? e.changedTouches[0] : e
          const cellAtPos = touch ? getCellAtPos(touch.clientX, touch.clientY) : null
          const lastCell = selectedCells[selectedCells.length - 1]
          const isStillOnLastCell =
            cellAtPos && cellAtPos.r === lastCell.r && cellAtPos.c === lastCell.c
          if (!isStillOnLastCell) {
            setSelectedCells([])
          }
        }
      }
    },
    [selectedCells, submitAttempt]
  )

  useEffect(() => {
    const handleGlobalUp = (e) => {
      if (isDragging) handleEnd(e)
    }
    const handleClickOutside = () => {
      if (!submittingRef.current && selectedCells.length > 0) {
        setSelectedCells([])
      }
    }
    window.addEventListener('mouseup', handleGlobalUp)
    window.addEventListener('touchend', handleGlobalUp)
    window.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp)
      window.removeEventListener('touchend', handleGlobalUp)
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDragging, selectedCells, handleEnd])

  const handleHint = async () => {
    if (hintCounter < 5 || gameStatus === 'won' || hintLoading) return
    setHintLoading(true)
    try {
      const res = await getStrandsHint()
      const coords = Array.isArray(res.hint) ? res.hint.map(([r, c]) => ({ r, c })) : []
      setHintCells(coords)
      setHintCounter(res.hint_counter ?? 0)
    } catch {
      showToast('No pudimos obtener una pista.', 'error')
    } finally {
      setHintLoading(false)
    }
  }

  const handleReplay = async () => {
    if (replaying) return
    setReplaying(true)
    try {
      try {
        await startStrands()
      } catch (err) {
        if (!isSessionAlreadyCreated(err)) throw err
      }
      const data = await getStrandsGame()
      applySessionData(data)
      showToast('¡Nuevo tablero listo!', 'success')
    } catch {
      showToast('No pudimos iniciar una nueva partida.', 'error')
    } finally {
      setReplaying(false)
    }
  }

  const handleRetry = () => {
    setLoadError('')
    setLoadTrigger((n) => n + 1)
  }

  if (authLoading || !isAuthenticated) {
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
        <div className="strands-loading" role="status" aria-live="polite">
          <p className="strands-loading-text">Cargando…</p>
        </div>
      </div>
    )
  }

  if (!grid.length) {
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
        <div className="strands-loading" role="status" aria-live="polite">
          <p className="strands-loading-text">{loadError || 'Cargando tablero de Strands…'}</p>
          {loadError && (
            <div className="strands-loading-actions">
              <button className="btn-action" onClick={handleRetry}>
                Reintentar
              </button>
              <button className="btn-home" onClick={onGoHome}>
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const cols = grid[0]?.length || 6
  const currentWordPreview = selectedCells.map((cell) => grid[cell.r]?.[cell.c] || '').join('')

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
      <div className="strands-container">
        <div className="strands-header">
          <h1 className="strands-title">STRANDS</h1>
          <p className="strands-hint">Tema: {theme || 'Un día especial'}</p>
          <p className="strands-current-word" aria-live="polite">
            {currentWordPreview || '\u00A0'}
          </p>
        </div>

        <div className="strands-layout">
          <div
            className="strands-grid"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            ref={gridRef}
          >
            <svg className="strands-svg-layer">
              {foundPaths.map((path, pathIdx) => {
                const isSpangramPath = Boolean(spangram && getPathWord(path) === spangram)
                return path.map((cell, i) => {
                  if (i === 0) return null
                  const start = getCellCenter(path[i - 1].r, path[i - 1].c)
                  const end = getCellCenter(cell.r, cell.c)
                  if (!start || !end) return null
                  return (
                    <line
                      key={`found-${pathIdx}-${i}`}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={isSpangramPath ? '#fef08a' : '#bfdbfe'}
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                  )
                })
              })}
              {selectedCells.length > 1 &&
                selectedCells.map((cell, i) => {
                  if (i === 0) return null
                  const start = getCellCenter(selectedCells[i - 1].r, selectedCells[i - 1].c)
                  const end = getCellCenter(cell.r, cell.c)
                  if (!start || !end) return null
                  return (
                    <line
                      key={`selected-${i}`}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="var(--blue)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  )
                })}
            </svg>
            {grid.map((row, r) =>
              row.map((letter, c) => (
                <div
                  key={`${r}-${c}`}
                  data-row={r}
                  data-col={c}
                  className={`strand-cell ${isCellSelected(r, c) ? 'selected' : ''} ${isCellFound(r, c) ? 'found completed' : ''} ${isCellSpangram(r, c) ? 'spangram' : ''} ${isCellHinted(r, c) ? 'hinted' : ''}`}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleStart(r, c)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleStart(r, c)
                  }}
                >
                  {letter}
                </div>
              ))
            )}
          </div>

          <div className="strands-info">
            {gameStatus === 'won' && (
              <div className="victory-message">
                ¡Felicidades! Has encontrado todas las palabras.
              </div>
            )}
            <div className="words-remaining">
              Palabras encontradas: {foundWords.length} / {totalWords}
            </div>
            <div className="words-remaining">
              Palabras extra: {bonusWordsCount}
            </div>
            <button
              className="btn-hint"
              onClick={handleHint}
              disabled={hintCounter < 5 || gameStatus === 'won' || hintLoading}
            >
              {hintLoading ? 'Buscando pista…' : `Pista (${hintCounter}/5)`}
            </button>
            <div className="found-words">
              {foundWords.map((word, i) => (
                <span
                  key={i}
                  className={`found-word-tag ${spangram && word === spangram ? 'spangram' : ''}`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="strands-controls">
          {gameStatus === 'won' && (
            <button className="btn-action" onClick={handleReplay} disabled={replaying}>
              {replaying ? 'Creando…' : 'Jugar de nuevo'}
            </button>
          )}
          <button className="btn-home" onClick={onGoHome}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
