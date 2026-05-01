const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = {
  auth: {
    googleAuth: async (token: string) => {
      const response = await fetch(`${API_URL}/auth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!response.ok) throw new Error('Auth failed')
      return response.json()
    },

    verify: async (jwtToken: string) => {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      if (!response.ok) throw new Error('Verification failed')
      return response.json()
    },

    logout: async () => {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      return response.json()
    },

    getMe: async (jwtToken: string) => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    },
  },

  protected: {
    completeVerification: async (jwtToken: string, phone: string, amount: number) => {
      const response = await fetch(`${API_URL}/protected/complete-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ phone, amount }),
      })
      if (!response.ok) throw new Error('Verification failed')
      return response.json()
    },
  },
}
