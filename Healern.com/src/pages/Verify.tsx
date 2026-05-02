import { useState, type FormEvent } from 'react'
import { ArrowLeft, LockKeyhole, Smartphone } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { InputField } from '../components/InputField'
import logoIcon from '../assets/helearn_logo_icon.svg'
import { getRegisteredUser, markUserVerified } from '../lib/storage'

const PAYMENT_RECEIVER_NUMBER = '0112267013'

export function Verify() {
  const navigate = useNavigate()
  const registeredUser = getRegisteredUser()
  const [phoneNumber, setPhoneNumber] = useState(registeredUser?.phone ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [promptSent, setPromptSent] = useState(false)
  const [verified, setVerified] = useState(false)

  if (!registeredUser) {
    return <Navigate to="/register" replace />
  }

  const activeUser = registeredUser

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setPromptSent(true)
    setTimeout(() => {
      setSubmitting(false)
    }, 900)
  }

  function handleAuthorizationComplete() {
    markUserVerified(activeUser.phone)
    setVerified(true)
    setTimeout(() => navigate('/'), 0)
  }

  if (verified) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_34%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-3 py-4">
        <Card className="w-full max-w-md p-5 text-center sm:p-6">
          <p className="text-sm font-semibold uppercase text-emerald-600">Verification complete</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Account activated</h2>
          <p className="mt-2 text-sm text-slate-500">You can now continue to the dashboard.</p>
          <Button className="mt-6 w-full" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_34%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-3 py-4 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-4xl items-center sm:min-h-[calc(100dvh-3rem)]">
        <Card className="mx-auto w-full p-0">
          <div className="border-b border-slate-100 px-4 pb-4 pt-5 sm:px-6">
            <div className="mb-5 h-1 w-full rounded-full bg-blue-600" />
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-700 shadow-[0_12px_24px_rgba(37,99,235,0.24)]">
                <img src={logoIcon} alt="" className="h-9 w-9" />
                <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-tight text-slate-900">HELAEARN AGENCY</h1>
                <p className="text-sm text-slate-400">Account verification</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.1fr)]">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700 lg:self-start">
              <p className="text-[12px] font-semibold uppercase text-emerald-600">Verification fee</p>
              <p className="mt-1 text-4xl font-extrabold leading-none text-slate-900 sm:text-[42px]">Ksh100.00</p>
              <p className="mt-2 text-sm text-slate-500">One-time payment - Instant activation</p>
              <p className="mt-3 break-words text-[12px] font-semibold text-emerald-700">
                Payment receiving number: {PAYMENT_RECEIVER_NUMBER}
              </p>
            </div>

            <div className="min-w-0 space-y-4">
              <InputField
                label="M-PESA Phone Number"
                inputProps={{
                  value: phoneNumber,
                  onChange: (event) => setPhoneNumber(event.target.value),
                  placeholder: '0712 345 678',
                }}
                icon={<Smartphone size={16} />}
              />

              <div className="space-y-1 text-center text-[12px] leading-5">
                <p className="text-slate-400">Accepts: 07XX... - 254XX... - +254X...</p>
                <p className="font-medium text-slate-500">
                  M-PESA prompt will be sent to {phoneNumber || 'your number'} and received on{' '}
                  {PAYMENT_RECEIVER_NUMBER}
                </p>
              </div>

              {promptSent ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <p className="font-semibold">Check your phone for the M-PESA prompt</p>
                  <p className="mt-1 leading-6 text-blue-700">
                    Authorize the transaction by entering your M-PESA PIN on the popup message.
                  </p>
                  <Button type="button" className="mt-3 w-full" onClick={handleAuthorizationComplete}>
                    I have authorized payment
                  </Button>
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={submitting}>
                <span className="inline-flex min-w-0 items-center justify-center gap-2">
                  <LockKeyhole size={16} className="flex-shrink-0" />
                  {submitting ? 'Sending M-PESA Prompt...' : 'Pay Ksh100.00 and Send Prompt'}
                </span>
              </Button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="mx-auto flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-400 hover:bg-white/70 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ArrowLeft size={14} /> Logout
              </button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  )
}
