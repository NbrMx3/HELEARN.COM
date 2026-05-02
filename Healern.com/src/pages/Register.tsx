import { useState, type FormEvent } from 'react'
import { EyeOff, Mail, Smartphone, User, Globe, Lock, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { InputField } from '../components/InputField'
import { saveRegisteredUser } from '../lib/storage'

export function Register() {
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('Kenya')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    saveRegisteredUser({
      displayName,
      email,
      phone,
      country,
      password,
      invitedBy: 'Onlinebusiness',
    })

    navigate('/verify')
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#f7f9ff_0%,#eef2ff_100%)] px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-[380px] pt-14 sm:pt-16">
        <Card className="overflow-hidden p-0">
          <div className="h-1.5 w-full bg-blue-600" />

          <div className="px-4 pt-4 sm:px-5">
            <div className="flex items-start gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white shadow-[0_10px_18px_rgba(37,99,235,0.28)]">
                ⚡
                <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <div className="pt-0.5">
                <h1 className="text-[15px] font-extrabold leading-tight tracking-tight text-slate-900">HELAEARN AGENCY</h1>
                <p className="text-[12px] text-slate-400">Create account · Start earning today</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4 pt-4 sm:px-5">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-600">Invited by Onlinebusiness</span>
              <span className="text-emerald-500">🎁</span>
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
              label="Phone · M-PESA"
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
              inputProps={{
                type: 'password',
                value: password,
                onChange: (event) => setPassword(event.target.value),
                placeholder: 'Min. 6 characters',
              }}
              icon={<Lock size={16} />}
              rightSlot={<EyeOff size={16} className="text-slate-400" />}
            />

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-600 shadow-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                I agree to the <span className="font-semibold text-blue-700">Terms</span> &{' '}
                <span className="font-semibold text-blue-700">No-Refund Policy</span>
              </span>
            </label>

            <Button type="submit" className="w-full rounded-xl py-3.5 text-[14px] font-semibold" disabled={!agree || submitting}>
              <span className="inline-flex items-center gap-2">
                <Users size={16} /> Create Account
              </span>
            </Button>

            <div className="flex items-end justify-between pt-1 text-[11px] text-slate-300">
              <span>© 2026 HELEAARN AGENCY</span>
              <a href="/verify" className="font-semibold text-slate-500 hover:text-blue-700">
                Have an account? Sign In →
              </a>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}