import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, LockKeyhole, Smartphone } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { InputField } from '../components/InputField'
import equityLogo from '../assets/equity_logo.svg'
import logoIcon from '../assets/helearn_logo_icon.svg'
import mpesaLogo from '../assets/mpesa_logo.svg'
import {
  clearRegisteredUser,
  getMpesaPaymentStatus,
  getRegisteredUser,
  initiateMpesaStkPush,
  type RegisteredUser,
} from '../lib/storage'

const PAYMENT_RECEIVER_NUMBER = '0112267013'
const PAYMENT_RECEIVER_MSISDN = '+254112267013'
const VERIFICATION_AMOUNT = 100

export function Verify() {
  const navigate = useNavigate()
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [promptSent, setPromptSent] = useState(false)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')
  const [paymentError, setPaymentError] = useState('')

  function isValidPhoneNumber(value: string) {
    const digits = value.replace(/\D/g, '')
    return digits.length === 10 || digits.length === 12
  }

  useEffect(() => {
    let cancelled = false

    async function loadRegisteredUser() {
      const user = await getRegisteredUser()

      if (cancelled) {
        return
      }

      setRegisteredUser(user)
      setPhoneNumber(user?.phone ?? '')
      setLoading(false)
    }

    void loadRegisteredUser()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_34%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-3 py-4">
        <Card className="w-full max-w-md p-5 text-center sm:p-6">
          <p className="text-sm font-semibold uppercase text-blue-600">Loading verification</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Fetching your account</h2>
          <p className="mt-2 text-sm text-slate-500">Please wait while we load your registration from the database.</p>
        </Card>
      </main>
    )
  }

  if (!registeredUser) {
    return <Navigate to="/register" replace />
  }

  const activeUser = registeredUser

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) {
      return
    }

    setSubmitting(true)
    setPaymentMessage('')
    setPaymentError('')

    if (!isValidPhoneNumber(phoneNumber)) {
      setPaymentError('Enter a valid M-PESA phone number (07XXXXXXXX or 254XXXXXXXXX).')
      setSubmitting(false)
      return
    }

    void (async () => {
      try {
        const response = await initiateMpesaStkPush({
          registeredPhone: activeUser.phone,
          payerPhone: phoneNumber,
          amount: VERIFICATION_AMOUNT,
          accountReference: activeUser.phone,
          transactionDesc: 'HELAEARN verification fee',
        })

        setPromptSent(true)
        setPaymentMessage(response.message || 'M-PESA prompt sent. Approve it on your phone to continue.')
      } catch (error) {
        setPromptSent(false)
        setPaymentError(error instanceof Error ? error.message : 'Failed to send the M-PESA prompt')
      } finally {
        setSubmitting(false)
      }
    })()
  }

  async function handleAuthorizationComplete() {
    if (verifying) {
      return
    }

    setVerifying(true)
    setPaymentError('')

    try {
      const status = await getMpesaPaymentStatus(activeUser.phone)

      if (!status.verified) {
        setPaymentMessage(status.message || 'Payment is still processing. Try again in a few seconds.')
        return
      }

      setVerified(true)
      setTimeout(() => navigate('/'), 0)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to verify payment status')
    } finally {
      setVerifying(false)
    }
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
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-700 shadow-[0_12px_24px_rgba(37,99,235,0.24)]">
                <img src={logoIcon} alt="" className="h-9 w-9" />
                <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-tight text-slate-900">HELAEARN AGENCY</h1>
                <p className="text-sm text-[#051a4a]">Account verification</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3 lg:self-start">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700">
                <p className="text-[12px] font-semibold uppercase text-emerald-600">Verification fee</p>
                <p className="mt-1 text-4xl font-extrabold leading-none text-slate-900 sm:text-[42px]">Ksh{VERIFICATION_AMOUNT}.00</p>
                <p className="mt-2 text-sm text-slate-500">One-time payment - Instant activation</p>
                <p className="mt-3 wrap-break-word text-[12px] font-semibold text-emerald-700">
                  Pay to: {PAYMENT_RECEIVER_NUMBER}
                </p>
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-300 bg-white/90 p-2">
                  <img src={mpesaLogo} alt="M-PESA" className="h-14 w-14 shrink-0 rounded-full" />
                  <p className="text-[33px] font-black leading-[1.05] tracking-tight text-emerald-800">
                    Send money directly to {PAYMENT_RECEIVER_MSISDN}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-red-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={equityLogo} alt="Equity" className="h-12 w-24 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase text-red-700">Equity account</p>
                    <p className="text-sm font-semibold leading-5 text-slate-800">Pay Ksh100.00 to {PAYMENT_RECEIVER_NUMBER}</p>
                    <p className="text-xs font-semibold leading-5 text-red-700">Send money directly to {PAYMENT_RECEIVER_MSISDN}</p>
                  </div>
                </div>
              </div>
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
                  M-PESA prompt will be sent to {phoneNumber || 'your number'} and paid to {PAYMENT_RECEIVER_NUMBER}
                </p>
              </div>

              {paymentMessage ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {paymentMessage}
                </div>
              ) : null}

              {paymentError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {paymentError}
                </div>
              ) : null}

              {promptSent ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <p className="font-semibold">Check your phone for the M-PESA prompt</p>
                  <p className="mt-1 leading-6 text-blue-700">
                    Authorize the transaction by entering your M-PESA PIN on the popup message.
                  </p>
                  <Button type="button" className="mt-3 w-full" onClick={handleAuthorizationComplete} disabled={verifying}>
                    {verifying ? 'Checking payment status...' : 'I have authorized payment'}
                  </Button>
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={submitting}>
                <span className="inline-flex min-w-0 items-center justify-center gap-2">
                  <LockKeyhole size={16} className="shrink-0" />
                  {submitting ? 'Sending M-PESA Prompt...' : `Pay Ksh${VERIFICATION_AMOUNT}.00 and Send Prompt`}
                </span>
              </Button>

              <button
                type="button"
                onClick={() => {
                  clearRegisteredUser()
                  navigate('/')
                }}
                className="mx-auto flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-[#4c1d95] hover:bg-white/70 hover:text-[#3b0764] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ArrowLeft size={40} /> Logout
              </button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  )
}
