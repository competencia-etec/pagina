import './Maze.css'

// Fixed-size top-down minimap showing ONLY:
//  - player position (amber dot)
//  - exit position (a flag)
// No walls, cells, or fog.
export default function MiniMap({ playerX, playerY, exitX, exitY, mazeW, mazeH }) {
  if (!mazeW || !mazeH) return null

  const px = (playerX / mazeW) * 100 + '%'
  const py = (playerY / mazeH) * 100 + '%'
  const ex = (exitX / mazeW) * 100 + '%'
  const ey = (exitY / mazeH) * 100 + '%'

  return (
    <div className="mm2" title="Vos y la salida">
      <span className="mm2-player" style={{ left: px, top: py }} title="Vos" />
      <span className="mm2-exit" style={{ left: ex, top: ey }} title="Salida">⚑</span>
    </div>
  )
}