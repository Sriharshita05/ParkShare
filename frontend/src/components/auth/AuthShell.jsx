import { LogoMark } from '../ui/Logo'
import AuthShowcase from './AuthShowcase'

// Full-height page wrapper: ambient background + split-screen panel (brand left, form right).
export default function AuthShell({ children }) {
  return (
    <div className="relative isolate overflow-hidden">
      {/* page-level ambient lighting */}
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] animate-drift rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-[460px] w-[460px] animate-drift-slow rounded-full bg-[#8b7bff]/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-8 sm:py-12">
        <div className="grid w-full max-w-5xl animate-fade-up overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_2px_4px_rgba(15,29,61,.05),0_40px_80px_-24px_rgba(27,45,86,.35)] ring-1 ring-navy-100/70 lg:min-h-[680px] lg:grid-cols-[1.05fr_1fr]">
          <AuthShowcase />
          <div className="relative flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            {/* compact brand header for tablet and mobile */}
            <div className="relative mb-7 flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-[#2b2a7c] p-4 text-white lg:hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-500/40 blur-2xl" />
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <LogoMark className="h-6 w-6" />
              </span>
              <p className="relative text-sm font-semibold leading-snug">Turning unused spaces into opportunities.</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
