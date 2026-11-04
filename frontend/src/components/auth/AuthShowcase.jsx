import { MapPin, CheckCircle2 } from 'lucide-react'
import { LogoMark } from '../ui/Logo'
import ParkingIllustration from './ParkingIllustration'

// Brand panel shown beside the form on large screens.
export default function AuthShowcase() {
  return (
    <aside
      className="relative isolate hidden overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-[#2b2a7c] p-10 text-white lg:flex lg:flex-col xl:p-12"
      aria-label="About ParkShare"
    >
      {/* ambient lighting */}
      <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 animate-drift rounded-full bg-brand-500/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 -z-10 h-96 w-96 animate-drift-slow rounded-full bg-[#7b5cff]/30 blur-3xl" />
      {/* parking-grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[.07] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-glow">
          <LogoMark className="h-7 w-7" />
        </span>
        <span className="font-display text-xl font-extrabold">
          Park<span className="text-brand-300">Share</span>
        </span>
      </div>

      <div className="mt-10 max-w-md">
        <h2 className="text-4xl font-extrabold leading-[1.1] xl:text-[42px]">
          Turning unused spaces into{' '}
          <span className="bg-gradient-to-r from-brand-300 to-emerald-300 bg-clip-text text-transparent">opportunities.</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-navy-200">
          Join drivers and owners already saving time and earning with ParkShare.
        </p>
      </div>

      <div className="relative mt-auto pt-6">
        <ParkingIllustration className="mx-auto h-auto w-full max-w-[480px]" />
        <div className="absolute right-0 top-10 flex animate-float items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 shadow-card backdrop-blur-md [animation-delay:.8s]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-bold">200 m away</p>
            <p className="text-[11px] text-navy-200">₹30/hr · free now</p>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 flex animate-float items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 shadow-card backdrop-blur-md [animation-delay:2s]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-400/25 text-brand-200">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-bold">Booked in seconds</p>
            <p className="text-[11px] text-navy-200">Pay only for time used</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
