import { useEffect, useState, type FormEvent } from 'react'
import { LockKeyhole, Smartphone, ArrowLeft } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { InputField } from '../components/InputField'
import { getRegisteredUser, markUserVerified } from '../lib/storage'

export function Verify() {
  const navigate = useNavigate()
  const registeredUser = getRegisteredUser()
  const [phoneNumber, setPhoneNumber] = useState(registeredUser?.phone ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (registeredUser?.phone) {
      setPhoneNumber(registeredUser.phone)
    }
  }, [registeredUser?.phone])

  if (!registeredUser) {
    return <Navigate to="/register" replace />
  }

  const activeUser = registeredUser

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    markUserVerified(activeUser.phone)
    setVerified(true)
    setTimeout(() => navigate('/'), 0)
  }

  if (verified) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_32%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Verification complete</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Account activated</h2>
          <p className="mt-2 text-sm text-slate-500">You can now continue to the dashboard.</p>
          <Button className="mt-6 w-full" onClick={() => navigate('/')}>Return Home</Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_32%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-98.5 pt-6 sm:pt-10">
        <Card className="p-0">
          <div className="border-b border-slate-100 px-5 pt-5 pb-4 sm:px-6">
            <div className="mb-5 h-1 w-full rounded-full bg-blue-600" />
            <div className="flex items-start gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)]">
                ⚡
                <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">HELAEARN AGENCY</h1>
                <p className="text-sm text-slate-400">Account Verification</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4 sm:px-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-emerald-600">Verification fee</p>
              <p className="mt-1 text-[34px] font-extrabold leading-none tracking-tight text-slate-900">Ksh100.00</p>
              <p className="text-sm text-slate-500">One-time payment · Instant activation</p>
            </div>

            <InputField
              label="M-PESA Phone Number"
              inputProps={{
                value: phoneNumber,
                onChange: (event) => setPhoneNumber(event.target.value),
                placeholder: '0712 345 678',
              }}
              icon={<Smartphone size={16} />}
            />

            <p className="-mt-2 text-center text-[12px] text-slate-400">Accepts: 07XX... · 254XX... · +254X...</p>

            <Button type="submit" className="w-full rounded-2xl" disabled={submitting}>
              <span className="inline-flex items-center gap-2">
                <LockKeyhole size={16} /> Pay Ksh100.00 & Activate
              </span>
            </Button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mx-auto flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={14} /> Logout
            </button>
          </form>
        </Card>
      </div>
    </main>
  )
}