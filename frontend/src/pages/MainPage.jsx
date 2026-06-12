import './MainPage.css'

const LEADERBOARD = [
  { rank: 1, name: 'Valentina R.', points: 2340 },
  { rank: 2, name: 'Tomás G.', points: 2180 },
  { rank: 3, name: 'Camila S.', points: 1950 },
  { rank: 4, name: 'Mateo L.', points: 1720 },
  { rank: 5, name: 'Sofía M.', points: 1580 },
]

const GAMES = [
  { id: 'trivia', title: 'Trivia Rápida', description: 'Respondé preguntas contra reloj.', icon: '⚡' },
  { id: 'memoria', title: 'Memoria', description: 'Encontrá los pares antes que nadie.', icon: '🧠' },
  { id: 'palabras', title: 'Cadena de Palabras', description: 'Formá la cadena más larga.', icon: '🔗' },
  { id: 'codigo', title: 'Desafío Código', description: 'Resolvé problemas de lógica y programación.', icon: '💻' },
]

export default function MainPage({ onGoLogin, onGoRegister, onLogout, user }) {
  const isLoggedIn = !!user

  return (
    <div className="main-page">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className="main-nav">
        <div className="logo">
          <span className="logo-comp">comp</span>
          <span className="logo-etec">ETec</span>
        </div>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button id="btn-logout" className="btn-nav" onClick={onLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button id="btn-nav-login" className="btn-nav" onClick={onGoLogin}>
                Iniciar sesión
              </button>
              <button id="btn-nav-register" className="btn-nav btn-nav--primary" onClick={onGoRegister}>
                Registrate
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <header className="main-hero">
        <p className="main-eyebrow">competencia 2026</p>
        <h1 className="main-title">Competí. Sumá puntos. Ganá.</h1>
        <p className="main-subtitle">
          Desafiá a tus compañeros en juegos rápidos y escalá en el ranking de tu curso.
        </p>
        {!isLoggedIn && (
          <div className="hero-cta">
            <button id="btn-hero-register" className="btn-primary" onClick={onGoRegister}>
              Empezar ahora
            </button>
            <button id="btn-hero-login" className="btn-secondary" onClick={onGoLogin}>
              Ya tengo cuenta
            </button>
          </div>
        )}
      </header>

      {/* ─── Games ──────────────────────────────────────────────── */}
      <section className="main-section" aria-labelledby="games-heading">
        <h2 id="games-heading" className="section-title">Juegos</h2>
        <div className="games-grid">
          {GAMES.map((game) => (
            <article key={game.id} className="game-card" id={`game-${game.id}`}>
              <span className="game-icon">{game.icon}</span>
              <h3 className="game-title">{game.title}</h3>
              <p className="game-desc">{game.description}</p>
              <button className="btn-play" disabled={!isLoggedIn}>
                {isLoggedIn ? 'Jugar' : 'Iniciá sesión'}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Leaderboard ────────────────────────────────────────── */}
      <section className="main-section" aria-labelledby="leaderboard-heading">
        <h2 id="leaderboard-heading" className="section-title">Ranking</h2>
        <div className="leaderboard">
          <div className="lb-header">
            <span className="lb-col lb-col--rank">#</span>
            <span className="lb-col lb-col--name">Jugador</span>
            <span className="lb-col lb-col--pts">Puntos</span>
          </div>
          {LEADERBOARD.map((entry) => (
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
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="main-footer">
        <p>compETec © 2026 — Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
