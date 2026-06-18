import './MainPage.css'

const LEADERBOARD = [
  { rank: 1, name: 'Valen_ETEC_5to 🏆', points: 2340 },
  { rank: 2, name: 'Tomy_4to_C', points: 2180 },
  { rank: 3, name: 'Cami_Sys', points: 1950 },
  { rank: 4, name: 'Mateo_Linux', points: 1720 },
  { rank: 5, name: 'Sofi_Compiler', points: 1580 },
]

const GAMES = [
  { id: 'wordle', title: 'Wordle', description: 'Adiviná la palabra técnica del día. Seis intentos para no quedar como un n00b.' },
  { id: 'connections', title: 'Connections', description: 'Encontrá el patrón y armá los 4 grupos de conceptos. Ojo con las trampas.' },
  { id: 'laberinto', title: 'Laberinto Falso 3D', description: 'Navegá a ciegas y encontrá la salida del pasillo antes de perderte en el código.' },
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
            <button id="btn-nav-login" className="btn-nav" onClick={onGoLogin}>
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <header className="main-hero">
        <p className="main-eyebrow">TORNEO ETEC 2026</p>
        <h1 className="main-title">¿Cuánto sabés de código? Demostralo.</h1>
        <p className="main-subtitle">
          Desafíos rápidos para técnicos, programadores y curiosos. Escalá en la tabla y convertite en leyenda del aula.
        </p>
        {!isLoggedIn && (
          <div className="hero-cta">
            <button id="btn-hero-register" className="btn-primary" onClick={onGoRegister}>
              Unirse al torneo
            </button>
            <button id="btn-hero-login" className="btn-secondary" onClick={onGoLogin}>
              Volver a entrar
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
              <h3 className="game-title">{game.title}</h3>
              <p className="game-desc">{game.description}</p>
              <button className="btn-play" id={`btn-play-${game.id}`}>
                Jugar
              </button>
              {!isLoggedIn && <span className="game-warning">Sin guardar puntos</span>}
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
