export type RegisteredUser = {
  displayName: string
  email: string
  idNumber: string
  phone: string
  country: string
  password: string
  invitedBy: string
  verified: boolean
  createdAt: string
  verifiedAt?: string
}

export type MpesaStkPushRequest = {
  registeredPhone: string
  payerPhone: string
  amount: number
  accountReference?: string
  transactionDesc?: string
}

export type MpesaStkPushResponse = {
  success: boolean
  message: string
  checkoutRequestId?: string
  merchantRequestId?: string
}

export type MpesaPaymentStatus = {
  success: boolean
  verified: boolean
  paymentStatus: string | null
  message: string
  receiptNumber?: string | null
  amount?: number | null
  payerPhone?: string | null
  registeredPhone?: string | null
}

const STORAGE_KEY = 'helearn:registered-phone'
const STORAGE_USER_KEY = 'helearn:registered-user'
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'https://helearn-api.onrender.com/api'

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

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawUser = window.localStorage.getItem(STORAGE_USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as RegisteredUser
  } catch {
    return null
  }
}

function storeUser(user: RegisteredUser) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
  storePhone(user.phone)
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

function buildLocalRegisteredUser(user: Omit<RegisteredUser, 'verified' | 'createdAt'>, verified = false): RegisteredUser {
  return {
    ...user,
    verified,
    createdAt: new Date().toISOString(),
  }
}

export function getStoredRegisteredPhone() {
  return readStoredPhone()
}

export async function getRegisteredUser() {
  const phone = readStoredPhone()

  if (!phone) {
    return readStoredUser()
  }

  try {
    return await requestJson<RegisteredUser>(`/users/${encodeURIComponent(phone)}`)
  } catch {
    return readStoredUser()
  }
}

export async function saveRegisteredUser(user: Omit<RegisteredUser, 'verified' | 'createdAt'>) {
  try {
    const payload = await requestJson<RegisteredUser>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    })

    storeUser(payload)
    return payload
  } catch {
    const localUser = buildLocalRegisteredUser(user)
    storeUser(localUser)
    return localUser
  }
}

export async function markUserVerified(phone: string) {
  try {
    const updatedUser = await requestJson<RegisteredUser>(`/users/${encodeURIComponent(phone)}/verify`, {
      method: 'PATCH',
    })

    storeUser(updatedUser)
    return updatedUser
  } catch {
    const localUser = readStoredUser()

    if (!localUser || localUser.phone !== phone) {
      return null
    }

    const updatedLocalUser: RegisteredUser = {
      ...localUser,
      verified: true,
      verifiedAt: new Date().toISOString(),
    }

    storeUser(updatedLocalUser)
    return updatedLocalUser
  }
}

export async function initiateMpesaStkPush(request: MpesaStkPushRequest) {
  return requestJson<MpesaStkPushResponse>('/mpesa/stkpush', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function getMpesaPaymentStatus(registeredPhone: string) {
  return requestJson<MpesaPaymentStatus>(`/mpesa/status/${encodeURIComponent(registeredPhone)}`)
}

export function clearRegisteredUser() {
  clearPhone()
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_USER_KEY)
  }
}
