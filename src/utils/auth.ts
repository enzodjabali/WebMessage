import { config } from '@/config'

// Computed base URI for WebSocket connection
export const getBaseURI = (): string => {
  const protocol = config.ssl ? 'wss' : 'ws'
  return `${protocol}://${config.ipAddress}:${config.port}`
}

// Hash password using SHA-256
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const AUTH_KEY = 'isAuthenticated'
const AUTH_EXPIRY_KEY = 'authExpiresAt'
const SESSION_MS = 30 * 24 * 60 * 60 * 1000

export const requestPersistentStorage = async (): Promise<void> => {
  try {
    if (navigator.storage && navigator.storage.persist && navigator.storage.persisted) {
      const already = await navigator.storage.persisted()
      if (!already) await navigator.storage.persist()
    }
  } catch (e) {
    void e
  }
}

export const setAuthenticated = (remember: boolean): void => {
  clearAuthentication()
  if (remember) {
    localStorage.setItem(AUTH_KEY, 'true')
    localStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() + SESSION_MS))
  } else {
    sessionStorage.setItem(AUTH_KEY, 'true')
  }
}

export const isAuthenticated = (): boolean => {
  if (sessionStorage.getItem(AUTH_KEY) === 'true') return true

  if (localStorage.getItem(AUTH_KEY) !== 'true') return false

  const rawExpiry = localStorage.getItem(AUTH_EXPIRY_KEY)
  const expiry = rawExpiry ? parseInt(rawExpiry, 10) : Date.now() + SESSION_MS

  if (Number.isNaN(expiry) || Date.now() >= expiry) {
    clearAuthentication()
    return false
  }

  localStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() + SESSION_MS))
  return true
}

export const clearAuthentication = (): void => {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(AUTH_EXPIRY_KEY)
  sessionStorage.removeItem(AUTH_KEY)
}
