import { useEffect } from 'react';
import * as auth from '../../services/auth.js';

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      auth.showToast('No se recibió el token', 'error');
      window.location.href = '/login';
      return;
    }

    const handleToken = async () => {
      try {
        await auth.handleCallback(token);
        auth.showToast('Inicio de sesión exitoso', 'success');
        
        // Clean URL and redirect to home
        window.history.replaceState({}, '', '/');
        window.location.href = '/';
      } catch (err) {
        console.error('Callback error:', err);
        auth.showToast('Error al iniciar sesión', 'error');
        window.location.href = '/login';
      }
    };

    handleToken();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Cargando...</p>
    </div>
  );
}
