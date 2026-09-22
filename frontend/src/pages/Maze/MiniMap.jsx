import './Maze.css'

// Fixed-size top-down minimap showing ONLY:
//  - player position (amber dot)
//  - exit position (a flag)
// No walls, cells, or fog.
export default function MiniMap({ playerX, playerY, exitX, exitY, mazeW, mazeH }) {
  if (!mazeW || !mazeH) return null

  // Clamp to [6%, 94%] so dots near the maze edge aren't half-clipped
  const clamp01 = (v) => Math.min(0.94, Math.max(0.06, v))
  const px = `${clamp01(playerX / mazeW) * 100}%`
  const py = `${clamp01(playerY / mazeH) * 100}%`
  const ex = `${clamp01(exitX / mazeW) * 100}%`
  const ey = `${clamp01(exitY / mazeH) * 100}%`

  return (
    <div className="mm2" title="Vos y la salida">
      <span className="mm2-player" style={{ left: px, top: py }} title="Vos" />
      <span className="mm2-exit" style={{ left: ex, top: ey }} title="Salida">⚑</span>
    </div>
  )
}