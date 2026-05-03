export type RegisteredUser = {
  displayName: string
  email: string
  phone: string
  country: string
  password: string
  invitedBy: string
  verified: boolean
  createdAt: string
  verifiedAt?: string
}

const STORAGE_KEY = 'helearn:registered-phone'
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api'

function readStoredPhone() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(STORAGE_KEY)
}

function storePhone(phone: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, phone)
}

function clearPhone() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const error = (await response.json()) as { error?: string }
      if (error.error) {
        message = error.error
      }
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new Error('Invalid response from server')
  }
}

export function getStoredRegisteredPhone() {
  return readStoredPhone()
}

export async function getRegisteredUser() {
  const phone = readStoredPhone()

  if (!phone) {
    return null
  }

  try {
    return await requestJson<RegisteredUser>(`/users/${encodeURIComponent(phone)}`)
  } catch {
    return null
  }
}

export async function saveRegisteredUser(user: Omit<RegisteredUser, 'verified' | 'createdAt'>) {
  const payload = await requestJson<RegisteredUser>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  })

  storePhone(payload.phone)
  return payload
}

export async function markUserVerified(phone: string) {
  try {
    const updatedUser = await requestJson<RegisteredUser>(`/users/${encodeURIComponent(phone)}/verify`, {
      method: 'PATCH',
    })

    storePhone(updatedUser.phone)
    return updatedUser
  } catch {
    return null
  }
}

export function clearRegisteredUser() {
  clearPhone()
}

const THEME_KEY = 'helearn:theme-mode'
export type ThemeMode = 'light' | 'dark' | 'system'

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null
  const v = window.localStorage.getItem(THEME_KEY)
  if (!v) return null
  if (v === 'dark' || v === 'light' || v === 'system') return v
  return null
}

export function storeTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(THEME_KEY, mode)
}

export function clearStoredTheme() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(THEME_KEY)
}
