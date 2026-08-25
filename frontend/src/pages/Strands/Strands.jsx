import { useState, useEffect, useRef } from 'react'
import './Strands.css'

const word_matrix = [
    "FMISWO",
    "KALIRV",
    "ISIYNG",
    "SNDDEW",
    "GKACBO",
    "EFTUQU",
    "IRESAN",
    "ENDDCE"
]

const words = ["FAMILY", "VOWS", "RING", "KISS", "WEDDING", "CAKE", "BOUQUET", "FRIENDS", "DANCE"]
const SPANGRAM = "WEDDING"

export default function Strands({ onGoHome }) {
    const [selectedCells, setSelectedCells] = useState([]) // Array of {r, c}
    const [foundWords, setFoundWords] = useState([])
    const [foundCells, setFoundCells] = useState([]) // Array of {r, c}
    const [foundSpangram, setFoundSpangram] = useState(false)
    const [foundPaths, setFoundPaths] = useState([]) // Array of Arrays of {r, c}
    const [isDragging, setIsDragging] = useState(false)
    const gridRef = useRef(null)

    const ROWS = word_matrix.length
    const COLS = word_matrix[0].length

    const getCellAtPos = (x, y) => {
        const element = document.elementFromPoint(x, y)
        if (!element) return null
        const r = element.getAttribute('data-row')
        const c = element.getAttribute('data-col')
        if (r !== null && c !== null) {
            return { r: parseInt(r), c: parseInt(c) }
        }
        return null
    }

    const isAdjacent = (cell1, cell2) => {
        const dr = Math.abs(cell1.r - cell2.r)
        const dc = Math.abs(cell1.c - cell2.c)
        return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0)
    }

    const handleStart = (r, c) => {
        if (isCellFound(r, c)) return

        const isLastSelected = selectedCells.length > 0 && 
            selectedCells[selectedCells.length - 1].r === r && 
            selectedCells[selectedCells.length - 1].c === c

        if (isLastSelected && selectedCells.length > 1) {
            // Clicked the last selected cell -> complete word
            const currentWord = selectedCells.map(cell => word_matrix[cell.r][cell.c]).join('')
            if (words.includes(currentWord) && !foundWords.includes(currentWord)) {
                if (currentWord === SPANGRAM) setFoundSpangram(true)
                setFoundWords([...foundWords, currentWord])
                setFoundCells([...foundCells, ...selectedCells])
                setFoundPaths([...foundPaths, [...selectedCells]])
                setSelectedCells([])
            } else {
                // Si se hace click en la última y no es palabra, no deseleccionamos todo, 
                // permitimos que el usuario siga o deseleccione arrastrando/clickeando fuera.
            }
            return
        }

        const existingIndex = selectedCells.findIndex(sc => sc.r === r && sc.c === c)
        if (existingIndex !== -1) {
            // Clicked a previously selected cell (not the last one) -> backtrack
            // Solo si es la penúltima
            if (existingIndex === selectedCells.length - 2) {
                setSelectedCells(selectedCells.slice(0, -1))
                setIsDragging(true)
            }
            return
        }

        if (selectedCells.length === 0) {
            setIsDragging(true)
            setSelectedCells([{ r, c }])
        } else {
            const lastCell = selectedCells[selectedCells.length - 1]
            if (isAdjacent(lastCell, { r, c })) {
                setSelectedCells([...selectedCells, { r, c }])
                setIsDragging(true)
            } else {
                // Not adjacent -> restart selection
                setSelectedCells([{ r, c }])
                setIsDragging(true)
            }
        }
    }

    const handleMove = (e) => {
        if (!isDragging) return
        
        const touch = e.touches ? e.touches[0] : e
        const cell = getCellAtPos(touch.clientX, touch.clientY)
        
        if (cell && !isCellFound(cell.r, cell.c)) {
            const lastCell = selectedCells[selectedCells.length - 1]
            if (!lastCell) return

            // Check if it's already in selectedCells (backtracking)
            const existingIndex = selectedCells.findIndex(sc => sc.r === cell.r && sc.c === cell.c)
            
            if (existingIndex !== -1) {
                // If it's the second to last, we are backtracking one step
                if (existingIndex === selectedCells.length - 2) {
                    setSelectedCells(selectedCells.slice(0, -1))
                }
            } else if (isAdjacent(lastCell, cell)) {
                setSelectedCells([...selectedCells, cell])
            }
        }
    }

    const handleEnd = (e) => {
        // Determinamos si fue un drag o un click.
        // Si hay más de una celda seleccionada, y se soltó el mouse,
        // solo limpiamos si NO fue un click (o sea, si hubo movimiento o si el mouse no está sobre una celda)
        
        if (selectedCells.length === 0) {
            setIsDragging(false)
            return
        }

        const currentWord = selectedCells.map(cell => word_matrix[cell.r][cell.c]).join('')
        
        if (words.includes(currentWord) && !foundWords.includes(currentWord)) {
            if (currentWord === SPANGRAM) setFoundSpangram(true)
            setFoundWords([...foundWords, currentWord])
            setFoundCells([...foundCells, ...selectedCells])
            setFoundPaths([...foundPaths, [...selectedCells]])
            setSelectedCells([])
        } else if (isDragging && selectedCells.length > 1) {
            // Para evitar que se borre al hacer click en la segunda letra:
            // Verificamos si el cursor sigue sobre la última celda seleccionada.
            // Si es un evento de mouseup real, podemos chequear la posición.
            const touch = e.changedTouches ? e.changedTouches[0] : e
            const cellAtPos = getCellAtPos(touch.clientX, touch.clientY)
            const lastCell = selectedCells[selectedCells.length - 1]
            
            const isStillOnLastCell = cellAtPos && cellAtPos.r === lastCell.r && cellAtPos.c === lastCell.c
            
            if (!isStillOnLastCell) {
                // Si soltó fuera de la última celda tras un arrastre, limpiamos.
                setSelectedCells([])
            }
        }
        
        setIsDragging(false)
    }

    const isCellFound = (r, c) => foundCells.some(cell => cell.r === r && cell.c === c)
    const isCellSpangram = (r, c) => {
        if (!foundSpangram) return false
        const spangramPath = foundPaths.find(path => 
            path.map(cell => word_matrix[cell.r][cell.c]).join('') === SPANGRAM
        )
        return spangramPath ? spangramPath.some(cell => cell.r === r && cell.c === c) : false
    }
    const isCellSelected = (r, c) => selectedCells.some(cell => cell.r === r && cell.c === c)

    const getCellCenter = (r, c) => {
        const cell = gridRef.current?.querySelector(`[data-row="${r}"][data-col="${c}"]`)
        if (!cell) return { x: 0, y: 0 }
        const rect = cell.getBoundingClientRect()
        const gridRect = gridRef.current.getBoundingClientRect()
        return {
            x: rect.left - gridRect.left + rect.width / 2,
            y: rect.top - gridRect.top + rect.height / 2
        }
    }

    useEffect(() => {
        const handleGlobalUp = (e) => {
            if (isDragging) {
                handleEnd(e)
            }
        }

        const handleClickOutside = () => {
            // Se ejecuta al hacer click en cualquier parte.
            // Gracias a stopPropagation en las celdas, si clickeamos una celda NO llega aquí.
            // Si clickeamos fuera de las celdas (pero dentro o fuera del grid), llega aquí.
            if (selectedCells.length > 0) {
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
    }, [isDragging, selectedCells, foundWords])

    return (
        <div className="strands-container">
            <div className="strands-header">
                <h1 className="strands-title">STRANDS</h1>
                <p className="strands-hint">Tema: Un día especial</p>
            </div>

            <div className="strands-layout">
                <div 
                    className="strands-grid"
                    onMouseMove={handleMove}
                    onTouchMove={handleMove}
                    ref={gridRef}
                >
                    <svg className="strands-svg-layer">
                        {foundPaths.map((path, pathIdx) => {
                            const isSpangramPath = path.map(cell => word_matrix[cell.r][cell.c]).join('') === SPANGRAM
                            return path.map((cell, i) => {
                                if (i === 0) return null
                                const start = getCellCenter(path[i - 1].r, path[i - 1].c)
                                const end = getCellCenter(cell.r, cell.c)
                                return (
                                    <line 
                                        key={`found-${pathIdx}-${i}`}
                                        x1={start.x} y1={start.y} 
                                        x2={end.x} y2={end.y} 
                                        stroke={isSpangramPath ? "#fef08a" : "#bfdbfe"} 
                                        strokeWidth="12" 
                                        strokeLinecap="round"
                                    />
                                )
                            })
                        })}
                        {selectedCells.length > 1 && selectedCells.map((cell, i) => {
                            if (i === 0) return null
                            const start = getCellCenter(selectedCells[i - 1].r, selectedCells[i - 1].c)
                            const end = getCellCenter(cell.r, cell.c)
                            return (
                                <line 
                                    key={`selected-${i}`}
                                    x1={start.x} y1={start.y} 
                                    x2={end.x} y2={end.y} 
                                    stroke="var(--blue)" 
                                    strokeWidth="12" 
                                    strokeLinecap="round"
                                    opacity="0.6"
                                />
                            )
                        })}
                    </svg>
                    {word_matrix.map((row, r) => (
                        row.split('').map((letter, c) => (
                            <div
                                key={`${r}-${c}`}
                                data-row={r}
                                data-col={c}
                                className={`strand-cell ${isCellSelected(r, c) ? 'selected' : ''} ${isCellFound(r, c) ? 'found completed' : ''} ${isCellSpangram(r, c) ? 'spangram' : ''}`}
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
                    ))}
                </div>

                <div className="strands-info">
                    {foundWords.length === words.length && (
                        <div className="victory-message" style={{
                            background: '#dcfce7', 
                            color: '#166534', 
                            padding: '12px', 
                            borderRadius: '8px',
                            fontFamily: 'var(--mono)',
                            textAlign: 'center',
                            marginBottom: '16px'
                        }}>
                            ¡Felicidades! Has encontrado todas las palabras.
                        </div>
                    )}
                    <div className="words-remaining">
                        Palabras encontradas: {foundWords.length} / {words.length}
                    </div>
                    <div className="found-words">
                        {foundWords.map((word, i) => (
                            <span key={i} className="found-word-tag">{word}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="strands-controls">
                <button className="btn-home" onClick={onGoHome}>Volver al inicio</button>
            </div>
        </div>
    )
}