import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Globe, Lock, Mail, Smartphone, User, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { InputField } from '../components/InputField'
import logoIcon from '../assets/helearn_logo_icon.svg'
import { saveRegisteredUser } from '../lib/storage'

export function Register() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('Kenya')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    try {
      await saveRegisteredUser({
        displayName,
        email,
        phone,
        country,
        password,
        invitedBy: 'Onlinebusiness',
      })

      navigate('/verify')
    } catch (error) {
      console.error(error)
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_34%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100dvh-2rem)] w-full max-w-6xl items-center gap-6 sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,0.75fr)_minmax(520px,720px)] lg:gap-10">
        <div className="hidden min-w-0 lg:block">
          <div className="max-w-md">
            <img src={logoIcon} alt="" className="h-14 w-14 rounded-lg bg-blue-700 p-1.5" />
            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-950">HELAEARN AGENCY</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Set up your account details and keep your M-PESA number ready for verification.
            </p>
          </div>
        </div>

        <Card className="mx-auto w-full max-w-3xl p-0 lg:mx-0 lg:max-w-none">
          <div className="border-b border-slate-100 px-4 pb-4 pt-5 sm:px-6">
            <div className="mb-5 h-1 w-full rounded-full bg-blue-600" />
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-700 shadow-[0_12px_24px_rgba(37,99,235,0.24)]">
                <img src={logoIcon} alt="" className="h-9 w-9" />
                <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-tight text-slate-900">HELAEARN AGENCY</h1>
                <p className="text-sm text-slate-400">Create account - Start earning today</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 px-4 py-4 sm:px-6 md:grid-cols-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700 md:col-span-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-600">Invited by Onlinebusiness</span>
              <span className="text-emerald-500">-</span>
              <span className="font-semibold text-emerald-600">Bonus</span>
            </div>

            <InputField
              label="Username (display name)"
              inputProps={{
                value: displayName,
                onChange: (event) => setDisplayName(event.target.value),
                placeholder: 'Your display name',
              }}
              icon={<User size={16} />}
            />

            <InputField
              label="Email"
              inputProps={{
                type: 'email',
                value: email,
                onChange: (event) => setEmail(event.target.value),
                placeholder: 'you@email.com',
              }}
              icon={<Mail size={16} />}
            />

            <InputField
              label="Phone - M-PESA"
              inputProps={{
                value: phone,
                onChange: (event) => setPhone(event.target.value),
                placeholder: '07XXXXXXXX',
              }}
              icon={<Smartphone size={16} />}
            />

            <InputField
              as="select"
              label="Country"
              selectProps={{
                value: country,
                onChange: (event) => setCountry(event.target.value),
              }}
              icon={<Globe size={16} />}
            >
              <option>Kenya</option>
              <option>Uganda</option>
              <option>Tanzania</option>
              <option>Rwanda</option>
            </InputField>

            <InputField
              label="Password"
              className="md:col-span-2"
              inputProps={{
                type: showPassword ? 'text' : 'password',
                value: password,
                onChange: (event) => setPassword(event.target.value),
                placeholder: 'Min. 6 characters',
              }}
              icon={<Lock size={16} />}
              rightSlot={
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((current) => !current)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <label className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-600 md:col-span-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="min-w-0">
                I agree to the <span className="font-semibold text-blue-700">Terms</span> and{' '}
                <span className="font-semibold text-blue-700">No-Refund Policy</span>
              </span>
            </label>

            <Button type="submit" className="w-full md:col-span-2" disabled={!agree || submitting}>
              <span className="inline-flex min-w-0 items-center justify-center gap-2">
                <Users size={16} className="flex-shrink-0" /> Create Account
              </span>
            </Button>

            <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
              <span>(c) 2026 HELEAARN AGENCY</span>
              <a href="/verify" className="font-medium text-slate-500 hover:text-blue-700">
                Have an account? Sign In -&gt;
              </a>
            </div>
          </form>
        </Card>
      </section>
    </main>
  )
}
