import './GameCard.css'

export default function GameCard({ game, isLoggedIn, onPlay }) {
  return (
    <article className="game-card" id={`game-${game.id}`}>
      <span className="game-icon">{game.icon}</span>
      <h3 className="game-title">{game.title}</h3>
      <p className="game-desc">{game.description}</p>
      <button className="btn-play" disabled={!isLoggedIn} onClick={() => onPlay(game.id)}>
        {isLoggedIn ? 'Jugar' : 'Iniciá sesión'}
      </button>
    </article>
  )
}
