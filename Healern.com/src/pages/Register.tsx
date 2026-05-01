import { ArrowRight, Eye, EyeOff, Gift, Lock, Mail, MapPin, Smartphone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { InputField } from '../components/InputField'
import { getRegisteredUser, saveRegisteredUser } from '../lib/storage'

type RegistrationFormValues = {
  displayName: string
  email: string
  phone: string
  country: string
  password: string
  agreeToTerms: boolean
}

const phonePattern = /^(?:07\d{8}|2547\d{8})$/

export function Register() {
  const navigate = useNavigate()
  const registeredUser = getRegisteredUser()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    defaultValues: {
      country: 'Kenya',
      agreeToTerms: true,
    },
  })

  if (registeredUser) {
    return <Navigate replace to="/verify" />
  }

  const onSubmit = async (values: RegistrationFormValues) => {
    const payload = saveRegisteredUser({
      displayName: values.displayName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.replace(/\s+/g, ''),
      country: values.country,
      password: values.password,
      invitedBy: 'Onlinebusiness',
    })

    console.log('Registration saved', payload)
    navigate('/verify', { replace: true })
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

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <InputField
              error={errors.displayName?.message}
              icon={<UserRound className="h-4 w-4" />}
              inputProps={{
                ...register('displayName', {
                  required: 'Username is required',
                  minLength: {
                    value: 2,
                    message: 'Enter at least 2 characters',
                  },
                }),
                placeholder: 'Your display name',
                autoComplete: 'name',
              }}
              label="Username (display name)"
            />

            <InputField
              error={errors.email?.message}
              icon={<Mail className="h-4 w-4" />}
              inputProps={{
                ...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                }),
                placeholder: 'you@email.com',
                type: 'email',
                autoComplete: 'email',
              }}
              label="Email"
            />

            <InputField
              error={errors.phone?.message}
              icon={<Smartphone className="h-4 w-4" />}
              helperText="Use 07XXXXXXXX or 2547XXXXXXXX"
              inputProps={{
                ...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: phonePattern,
                    message: 'Use a valid Kenyan phone number format',
                  },
                }),
                placeholder: '07XXXXXXXX',
                inputMode: 'numeric',
                autoComplete: 'tel',
              }}
              label="Phone (M-PESA format)"
            />

            <InputField
              as="select"
              error={errors.country?.message}
              icon={<MapPin className="h-4 w-4" />}
              label="Country"
              selectProps={{ ...register('country', { required: 'Country is required' }) }}
            >
              <option value="Kenya">Kenya</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Nigeria">Nigeria</option>
            </InputField>

            <InputField
              error={errors.password?.message}
              icon={<Lock className="h-4 w-4" />}
              inputProps={{
                ...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }),
                placeholder: 'Min. 6 characters',
                type: showPassword ? 'text' : 'password',
                autoComplete: 'new-password',
              }}
              label="Password"
              rightSlot={
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  type="button"
                  onClick={() => {
                    setShowPassword((current) => !current)
                  }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <input
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                type="checkbox"
                {...register('agreeToTerms', {
                  required: 'You must agree to the policy',
                })}
              />
              <span>
                I agree to the{' '}
                <span className="font-semibold text-blue-700">Terms &amp; No-Refund Policy</span>
              </span>
            </label>
            {errors.agreeToTerms?.message ? (
              <p className="text-xs font-medium text-rose-600">{errors.agreeToTerms.message}</p>
            ) : null}

            <Button className="h-12 w-full text-base" loading={isSubmitting} type="submit">
              Create Account
            </Button>
          </form>

          <footer className="flex items-center justify-between text-sm text-slate-500">
            <span>© 2026 HELAEARN AGENCY</span>
            <button
              className="inline-flex items-center gap-1 font-semibold text-blue-700 transition hover:text-blue-800"
              type="button"
              onClick={() => {
                navigate('/verify')
              }}
            >
              Have an account? Sign in
              <ArrowRight className="h-4 w-4" />
            </button>
          </footer>
        </div>
      </Card>
    </main>
  )
}
