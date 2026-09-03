import './Maze.css'

// possible_movements: [up, down, right, left] booleans, true = passage open
// FACING: 0=Up, 1=Right, 2=Down, 3=Left
const FACING_ARROW = ['↑', '→', '↓', '←']
const RADIUS = 5 // steps around the player
const SIZE = RADIUS * 2 + 1 // 11x11, fixed -> constant size, no reflow

export default function MiniMap({ explored, playerX, playerY, facing }) {
  const cells = []
  for (let dy = -RADIUS; dy <= RADIUS; dy++) {
    for (let dx = -RADIUS; dx <= RADIUS; dx++) {
      const x = playerX + dx
      const y = playerY + dy
      const key = `${x},${y}`
      const open = explored[key] // [up, down, right, left] or undefined
      const isPlayer = dx === 0 && dy === 0

      cells.push(
        <div
          key={key}
          className={`mm-cell${open ? ' mm-explored' : ' mm-fog'}${isPlayer ? ' mm-player' : ''}`}
          style={{
            borderTop: open && !open[0] ? 'var(--mm-wall-w) solid var(--mm-wall)' : undefined,
            borderBottom: open && !open[1] ? 'var(--mm-wall-w) solid var(--mm-wall)' : undefined,
            borderRight: open && !open[2] ? 'var(--mm-wall-w) solid var(--mm-wall)' : undefined,
            borderLeft: open && !open[3] ? 'var(--mm-wall-w) solid var(--mm-wall)' : undefined,
          }}
        >
          {isPlayer && <span className="mm-arrow">{FACING_ARROW[facing]}</span>}
        </div>
      )
    }
  }

  return (
    <div className="mm-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, var(--mm-size))` }}>
      {cells}
    </div>
  )
}