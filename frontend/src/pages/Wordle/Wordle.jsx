import { useEffect } from 'react';

export default function Wordle({ onGoHome, isLoggedIn }) {
  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onGoHome}>Volver</button>
      <h1>Wordle</h1>
      <p>Juego protegido - solo usuarios autenticados</p>
    </div>
  );
}
