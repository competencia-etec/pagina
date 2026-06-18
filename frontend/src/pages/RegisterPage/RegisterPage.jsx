import { GoogleIcon } from '../../components/GoogleIcon/GoogleIcon.jsx'

const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL ?? '/api/auth/google'

function handleGoogleRegister() {
  window.location.href = GOOGLE_OAUTH_URL
}

const FEATURES = [
  'Sin contraseña — solo Google.',
  'Tus puntos se guardan solos.',
  'Competís contra todos del curso.',
]

export default function RegisterPage({ onGoLogin, onGoHome, onRegisterSimulate }) {
  return (
    <main className="auth-card" role="main">
      <div className="logo" onClick={onGoHome} style={{ cursor: 'pointer' }} role="button" aria-label="Volver al inicio">
        <span className="logo-comp">comp</span>
        <span className="logo-etec">ETec</span>
      </div>

      <p className="auth-eyebrow">nueva cuenta</p>
      <h1 className="auth-title">Unite a competir.</h1>
      <p className="auth-subtitle">
        Un clic y ya estás adentro. Empezá a sumar puntos hoy.
      </p>

      <hr className="auth-divider" />

      <button
        id="btn-google-register"
        className="btn-google"
        onClick={handleGoogleRegister}
        aria-label="Registrarse con Google"
      >
        <GoogleIcon size={17} />
        Continuar con Google
      </button>

      {/* For development simulation without backend */}
      <button
        className="btn-play"
        style={{ marginTop: '12px', width: '100%', fontStyle: 'italic' }}
        onClick={onRegisterSimulate}
        aria-label="Simular registro"
      >
        (Simular Registro)
      </button>

      <ul className="auth-features" aria-label="Beneficios">
        {FEATURES.map((f) => (
          <li key={f} className="auth-feature-item">
            <span className="feature-tick">*</span>
            {f}
          </li>
        ))}
      </ul>

      <p className="auth-footer">
        ¿Ya tenés cuenta?{' '}
        <button id="link-go-login" onClick={onGoLogin}>
          Iniciá sesión
        </button>
      </p>

      <p className="auth-terms">
        Al registrarte aceptás los <a href="/terms">términos</a> y la{' '}
        <a href="/privacy">privacidad</a>.
      </p>
    </main>
  )
}
