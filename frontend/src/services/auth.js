const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_data'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export function showToast(message, type = 'info') {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.setAttribute('role', 'alert')
  toast.textContent = message
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('toast-visible'))
  setTimeout(() => {
    toast.classList.remove('toast-visible')
    setTimeout(() => toast.remove(), 300)
  }, 3500)
}

export function loginWithGoogle() {
  const url = import.meta.env.VITE_GOOGLE_OAUTH_URL ?? '/auth/login_oauth'
  window.location.href = url
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  console.log('[getToken] Returning:', token ? token.substring(0, 30) + '...' : 'none')
  return token
}

export function isAuthenticated() {
  return !!getToken()
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getCurrentUser() {
  const token = getToken()
  if (!token) return null

  const res = await fetch(`${API_BASE}/user/users/me/`, {
    headers: { ...authHeaders() },
  })

  if (!res.ok) {
    if (res.status === 401) {
      clearSession()
    }
    throw new Error(`No se pudo obtener el usuario (${res.status})`)
  }

  return res.json()
}

export async function fetchWithAuth(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  })

  if (res.status === 401) {
    clearSession()
    showToast('Tu sesión expiró. Iniciá sesión nuevamente.', 'error')
    throw new Error('Unauthorized')
  }

  return res
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function storeUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
