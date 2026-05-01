import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

export type User = {
  id: string
  email: string
  name: string
  picture?: string
}

export type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize state from localStorage
function initializeAuthState() {
  const storedToken = localStorage.getItem('auth_token')
  const storedUser = localStorage.getItem('auth_user')

  if (storedToken && storedUser) {
    try {
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
        isLoading: false,
      }
    } catch {
      // Invalid stored data, clear it
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  return {
    token: null,
    user: null,
    isLoading: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(() => initializeAuthState())

  const login = useCallback((newToken: string, newUser: User) => {
    setAuthState({
      token: newToken,
      user: newUser,
      isLoading: false,
    })
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setAuthState({
      token: null,
      user: null,
      isLoading: false,
    })
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('helearn:registered-user')
  }, [])

  const value: AuthContextType = {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.token && !!authState.user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook - exported in same file as context provider
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
