import { createContext, useContext, useState, useEffect } from 'react';
import * as auth from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = auth.getToken();
      if (token) {
        try {
          const currentUser = await auth.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Failed to restore session:', err);
          auth.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async () => {
    auth.loginWithGoogle();
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    auth.showToast('Sesión cerrada', 'success');
  };

  const refreshUser = async () => {
    const currentUser = await auth.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user && !loading,
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
