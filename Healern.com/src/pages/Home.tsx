import { Link } from 'react-router-dom'
import logoIcon from '../assets/helearn_logo_icon.svg'
import swahiliLogo from '../assets/helearn_swahili_logo.svg'

export function Home() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_34%),linear-gradient(180deg,#f9fbff_0%,#eef3ff_100%)] px-3 py-4 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100dvh-2rem)] w-full max-w-6xl items-center gap-6 sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:gap-10">
        {/* Mobile hero: visible on small screens */}
        <div className="lg:hidden mb-6 px-4">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="Helearn" className="h-10 w-10" />
            <div>
              <h2 className="text-lg font-bold">HELAEARN AGENCY</h2>
              <p className="text-sm text-slate-500">Learn Swahili — Native tutors, paid teaching</p>
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 lg:block">
          <div className="max-w-xl">
            <div className="inline-flex w-full max-w-[520px] items-center justify-center rounded-2xl bg-slate-950 px-6 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/5">
              <img src={swahiliLogo} alt="Helearn logo" className="h-auto w-full max-w-[460px]" />
            </div>

            <h1 className="mt-8 max-w-lg text-4xl font-bold leading-tight text-slate-950">
              Create your account and activate your <span className="text-blue-900">HELAEARN</span> membership.
            </h1>
            <p className="mt-4 max-w-lg text-[28px] leading-9 text-purple-700">
              Join through your invitation, complete verification, and continue to your member area.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[420px] rounded-lg border border-white/80 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-6 lg:mx-0 lg:justify-self-end">
          <div className="mb-5 h-1 w-full rounded-full bg-blue-600" />

          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-700">
              <img src={logoIcon} alt="Helearn Logo" className="h-10 w-10" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight text-slate-900">HELAEARN AGENCY</h1>
              <p className="text-sm text-slate-400">Create account - Start earning today</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            <span className="font-semibold text-emerald-600">Invited by Onlinebusiness</span>
            <span className="text-emerald-500">-</span>
            <span className="font-semibold text-emerald-600">Bonus</span>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-slate-700 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-700">About</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Helearn is an online platform where qualified tutors teach Swahili to foreigners worldwide - and get paid for it.
              Learn from native speakers. Earn from your language skills. All in one place.
            </p>
            <p className="mt-3 text-base font-bold text-slate-800">
              East African countries:{' '}
              <span className="text-[#0b2e6d]">
                <span className="cursor-pointer transition-colors duration-200 hover:text-[#061a42] hover:underline">Kenya</span>,{' '}
                <span className="cursor-pointer transition-colors duration-200 hover:text-[#061a42] hover:underline">Tanzania</span>,{' '}
                <span className="cursor-pointer transition-colors duration-200 hover:text-[#061a42] hover:underline">Uganda</span>,{' '}
                <span className="cursor-pointer transition-colors duration-200 hover:text-[#061a42] hover:underline">Rwanda</span>,{' '}
                <span className="cursor-pointer transition-colors duration-200 hover:text-[#061a42] hover:underline">Burundi</span>,{' '}
                <span className="cursor-pointer transition-colors duration-200 hover:text-[#061a42] hover:underline">S.Sudan</span>,{' '}
                <span className="cursor-pointer transition-colors duration-200 hover:text-[#061a42] hover:underline">DRC.Congo</span>
              </span>
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Regulated by EastAfrican Trade Custom Union
            </p>
          </div>

          <div className="mt-6 flex">
            <Link
              to="/register"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2f7ca8] px-6 py-3 text-sm font-semibold uppercase text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#2a7098] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7ca8] focus-visible:ring-offset-2 sm:w-44"
            >
              Join Now
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            For any assistance, feel free to contact us on WhatsApp{' '}
            <a href="https://wa.me/254112267013" className="font-semibold text-[#0b2e6d]">+254112267013</a>.
          </p>
        </div>
      </section>
    </main>
  )
}
