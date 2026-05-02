import { Link } from 'react-router-dom'
import logoIcon from '../assets/helearn_logo_icon.svg'

export function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_32%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-start justify-center pt-12 sm:pt-20">
        <div className="w-full rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="mb-6 h-1 w-full rounded-full bg-blue-600" />

          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-700">
              <img src={logoIcon} alt="Helearn Logo" className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">HELAEARN AGENCY</h1>
              <p className="text-sm text-slate-400">Create account · Start earning today</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <span className="font-semibold text-emerald-600">Invited by Onlinebusiness</span>
            <span className="mx-2 text-emerald-500">•</span>
            <span className="font-semibold text-emerald-600">Bonus</span>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/register"
              className="inline-flex w-36 items-center justify-center rounded-sm bg-[#2f7ca8] px-6 py-2.5 text-[12px] font-medium uppercase tracking-wide text-white shadow-[0_6px_12px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#2a7098] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7ca8] focus-visible:ring-offset-2"
            >
              Join Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
