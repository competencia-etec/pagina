import './Maze.css'

// facing: 0=Up(-y), 1=Right(+x), 2=Down(+y), 3=Left(-x)
// world bearing from player -> exit, in radians, where angle 0 = "up"(-y) on screen
// and increases clockwise (matching screen rotation +).
// Vector from player to exit: (dx, dy).
// Bearing (math): atan2(East, North) with screen coords: East=+x, North=-y.
//   worldRad = atan2(dx, -dy)  -> 0 when exit is "up", PI/2 when exit is "right".
// Relative to current facing: subtract facing*90deg.
// We want a CSS rotate(deg) that turns the needle's rest orientation (pointing up)
// to the exit in *view* space.
export default function Compass({ playerX, playerY, exitX, exitY, facing, won }) {
  let deg = null

  if (typeof exitX === 'number' && typeof exitY === 'number' && !won) {
    const dx = exitX - playerX
    const dy = exitY - playerY
    if (dx !== 0 || dy !== 0) {
      const worldRad = Math.atan2(dx, -dy)
      const facingRad = facing * (Math.PI / 2)
      const relRad = worldRad - facingRad
      deg = (relRad * 180) / Math.PI
    }
  }

  return (
    <div className="compass">
      <div className="compass-ring">
        <span className="compass-card compass-n">N</span>
        <span className="compass-card compass-e">E</span>
        <span className="compass-card compass-s">S</span>
        <span className="compass-card compass-w">O</span>
        <div
          className="compass-needle"
          style={deg == null ? { opacity: 0 } : { transform: `rotate(${deg}deg)` }}
        >
          <span className="compass-needle-head" />
          <span className="compass-needle-tail" />
        </div>
      </div>
      <span className="compass-label">{won ? '¡SALIDA!' : 'SALIDA'}</span>
    </div>
  )
}