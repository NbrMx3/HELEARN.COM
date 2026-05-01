import { CheckCircle2, LogOut, Smartphone, Zap } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { InputField } from '../components/InputField'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

type VerificationFormValues = {
  phone: string
}

const phonePattern = /^(?:07\d{8}|2547\d{8})$/

export function Verify() {
  const navigate = useNavigate()
  const { user, token, logout, isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [activationMessage, setActivationMessage] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    defaultValues: {
      phone: '',
    },
  })

  if (!isAuthenticated || !user) {
    return <Navigate replace to="/register" />
  }

  const onSubmit = async (values: VerificationFormValues) => {
    if (!token) return

    const normalizedPhone = values.phone.replace(/\s+/g, '')

    setIsProcessing(true)
    setActivationMessage(null)
    setError(null)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900))

      console.log('Mock payment request', {
        phone: normalizedPhone,
        amount: 100,
        account: user.email,
      })

      const result = await api.protected.completeVerification(token, normalizedPhone, 100)

      if (result.success) {
        setActivationMessage('Payment received. Account activated successfully.')
        setIsVerified(true)
      } else {
        setError('Payment could not be completed. Please try again.')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
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
              <p className="text-sm text-slate-500">Account Verification</p>
            </div>
          </header>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-medium text-slate-600">Logged in as:</p>
            <p className="flex items-center gap-2 text-slate-900">
              {user.picture && (
                <img
                  alt={user.name}
                  className="h-6 w-6 rounded-full"
                  src={user.picture}
                />
              )}
              <span className="font-semibold">{user.name}</span>
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Verification Fee
            </p>
            <div className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Ksh 100.00</div>
            <p className="mt-1 text-sm text-slate-500">One-time payment · Instant activation</p>
          </div>

          {activationMessage ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {activationMessage}
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
              {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              error={errors.phone?.message}
              icon={<Smartphone className="h-4 w-4" />}
              helperText="Accepted formats: 07XXXXXXXX, 2547XXXXXXXX"
              inputProps={{
                ...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: phonePattern,
                    message: 'Enter a valid M-PESA phone number',
                  },
                }),
                placeholder: '0712345678',
                inputMode: 'numeric',
                autoComplete: 'tel',
                disabled: isVerified,
              }}
              label="M-PESA Phone Number"
            />

            <Button
              className="h-12 w-full text-base"
              loading={isProcessing}
              type="submit"
              disabled={isVerified}
            >
              {isVerified ? 'Activated' : 'Pay Ksh 100.00 & Activate'}
            </Button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium text-slate-600">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick activation for registered users
            </div>
            <p className="mt-2">Accepted formats: 07XXXXXXXX, 2547XXXXXXXX</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              type="button"
              onClick={() => {
                logout()
                navigate('/', { replace: true })
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            {isVerified && (
              <button
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
                type="button"
                onClick={() => {
                  navigate('/dashboard', { replace: true })
                }}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </Card>
    </main>
  )
}
