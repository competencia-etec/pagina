import './Hero.css'

export default function Hero({ isLoggedIn, onGoLogin, onGoRegister }) {
  return (
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
  )
}
