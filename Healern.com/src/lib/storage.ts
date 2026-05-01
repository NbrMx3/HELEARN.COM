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

const STORAGE_KEY = 'helearn:registered-user'

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(key)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function getRegisteredUser() {
  return readJson<RegisteredUser>(STORAGE_KEY)
}

export function saveRegisteredUser(user: Omit<RegisteredUser, 'verified' | 'createdAt'>) {
  const payload: RegisteredUser = {
    ...user,
    verified: false,
    createdAt: new Date().toISOString(),
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload
}

export function markUserVerified(phone: string) {
  const currentUser = getRegisteredUser()

  if (!currentUser || currentUser.phone !== phone) {
    return null
  }

  const updatedUser: RegisteredUser = {
    ...currentUser,
    verified: true,
    verifiedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
  return updatedUser
}

export function clearRegisteredUser() {
  window.localStorage.removeItem(STORAGE_KEY)
}
