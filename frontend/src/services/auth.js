const API_BASE = 'http://localhost:8000';

export function loginWithGoogle() {
  const oauthUrl = import.meta.env.VITE_GOOGLE_OAUTH_URL || `${API_BASE}/auth/login_oauth`;
  window.location.href = oauthUrl;
}

export function handleCallback(token) {
  localStorage.setItem('access_token', token);
  return getCurrentUser();
}

export async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/user/users/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        logout();
        return null;
      }
      throw new Error('Failed to fetch user');
    }

    const user = await res.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
}

export function getToken() {
  return localStorage.getItem('access_token');
}

export function isAuthenticated() {
  return !!getToken();
}

export function getUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
