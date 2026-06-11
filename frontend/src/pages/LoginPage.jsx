import { GoogleIcon } from '../components/GoogleIcon'

const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL ?? '/api/auth/google'

function handleGoogleLogin() {
  window.location.href = GOOGLE_OAUTH_URL
}

export function LeftPanel() { return null } // no left panel in mobile-first layout

export default function LoginPage({ onGoRegister }) {
  return (
    <main className="auth-card" role="main">
      <div className="logo">
        <span className="logo-comp">comp</span>
        <span className="logo-etec">ETec</span>
      </div>

      <p className="auth-eyebrow">iniciar sesión</p>
      <h1 className="auth-title">Bienvenido de nuevo.</h1>
      <p className="auth-subtitle">
        Ingresá con tu cuenta de Google para competir y ver tu ranking.
      </p>

      <hr className="auth-divider" />

      <button
        id="btn-google-login"
        className="btn-google"
        onClick={handleGoogleLogin}
        aria-label="Iniciar sesión con Google"
      >
        <GoogleIcon size={17} />
        Continuar con Google
      </button>

      <p className="auth-footer">
        ¿No tenés cuenta?{' '}
        <button id="link-go-register" onClick={onGoRegister}>
          Registrate
        </button>
      </p>

      <p className="auth-terms">
        Al ingresar aceptás los <a href="/terms">términos</a> y la{' '}
        <a href="/privacy">privacidad</a>.
      </p>
    </main>
  )
}
