import './Navbar.css'

export default function Navbar({ isLoggedIn, user, onLogout, onGoLogin, onGoRegister, onGoHome }) {
  return (
    <nav className="main-nav">
      <div className="logo">
        <span className="logo-comp">comp</span>
        <span className="logo-etec">ETec</span>
      </div>

      <div className="nav-actions">
        {isLoggedIn ? (
          <>
            <span className="nav-user">{user?.name}</span>
            <button id="btn-nav-home" className="btn-nav btn-nav--ghost" onClick={onGoHome}>
              Volver
            </button>
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
  )
}
