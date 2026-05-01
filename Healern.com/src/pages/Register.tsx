import { Gift, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export function Register() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate replace to="/verify" />
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google')
      }

      const result = await api.auth.googleAuth(credentialResponse.credential)

      if (result.success && result.token && result.user) {
        login(result.token, result.user)
        navigate('/verify', { replace: true })
      } else {
        setError('Authentication failed. Please try again.')
      }
    } catch (err) {
      console.error('Google auth error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="space-y-5">
          <header className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">HELAEARN AGENCY</h1>
              <p className="text-sm text-slate-500">Create account · Start earning today</p>
            </div>
          </header>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2 font-semibold">
              <Gift className="h-4 w-4" />
              Invited by Onlinebusiness{' '}
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-emerald-700">
                Bonus
              </span>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-600">Sign in with Google</p>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  width="280"
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Or</span>
              </div>
            </div>

            <Button
              className="h-12 w-full text-base"
              loading={isLoading}
              disabled={isLoading}
              onClick={() => setError('Google Sign-in required')}
            >
              Manual Registration (Coming Soon)
            </Button>
          </div>

          <footer className="text-center text-xs text-slate-500">
            <span>© 2026 HELAEARN AGENCY</span>
          </footer>
        </div>
      </Card>
    </main>
  )
}
