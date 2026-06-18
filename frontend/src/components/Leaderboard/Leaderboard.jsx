import './Leaderboard.css'

export default function Leaderboard({ entries }) {
  return (
    <div className="leaderboard">
      <div className="lb-header">
        <span className="lb-col lb-col--rank">#</span>
        <span className="lb-col lb-col--name">Jugador</span>
        <span className="lb-col lb-col--pts">Puntos</span>
      </div>
      {entries.map((entry) => (
        <div
          key={entry.rank}
          className={`lb-row ${entry.rank <= 3 ? 'lb-row--top' : ''}`}
          id={`lb-row-${entry.rank}`}
        >
          <span className="lb-col lb-col--rank">
            {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
          </span>
          <span className="lb-col lb-col--name">{entry.name}</span>
          <span className="lb-col lb-col--pts">{entry.points.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
