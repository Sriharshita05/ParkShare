import { Search, MapPin, ShieldCheck, Zap, Car } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { heroStats } from '../../data/mockData'

function FloatingCard({ className = '', children }) {
  return (
    <div className={`absolute rounded-2xl border border-white bg-white/90 p-3.5 shadow-card backdrop-blur ${className}`}>
      {children}
    </div>
  )
}

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const submit = (e) => {
    e.preventDefault()
    navigate(`/find?q=${encodeURIComponent(query)}`)
  }

  return (
    <section className="relative overflow-hidden">
      <div className="dot-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <div className="container-page relative grid items-center gap-12 pb-20 pt-10 lg:grid-cols-2 lg:pb-28 lg:pt-16">
        <div className="animate-fade-up">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Community-powered parking
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] text-navy-900 sm:text-5xl lg:text-[56px]">
            Smart Parking for a <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">Smarter Tomorrow</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-600">
            Find a private space near your destination in seconds, or turn your unused parking into steady income.
            Real-time availability, fair pricing, secure payments.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-navy-100 bg-white p-2 shadow-card sm:flex-row"
          >
            <label className="flex flex-1 items-center gap-3 px-3">
              <Search className="h-5 w-5 shrink-0 text-brand-600" />
              <span className="sr-only">Destination</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where are you headed? e.g. ABC Company"
                className="w-full bg-transparent py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none"
              />
            </label>
            <Button type="submit" size="lg">
              Find parking
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-600">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified owners</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-emerald-600" /> Pay only for time used</span>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-navy-100 pt-6">
            {heroStats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-2xl font-extrabold text-navy-900">{s.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-navy-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative mx-auto h-[420px] w-full max-w-lg sm:h-[480px]">
          <div className="absolute inset-4 rotate-3 rounded-[2rem] bg-gradient-to-br from-brand-500 to-navy-900 opacity-95 shadow-lift" />
          <div className="absolute inset-4 -rotate-2 overflow-hidden rounded-[2rem] border border-white/60 bg-[#eaf2fc] shadow-card">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
              <rect width="100" height="100" fill="#eaf2fc" />
              <rect x="8" y="58" width="22" height="16" rx="2" fill="#d3efe1" />
              {[[10,8,16,14],[36,8,18,12],[62,10,16,16],[10,32,14,14],[60,38,18,14],[36,60,14,12],[66,64,18,14]].map(([x,y,w,h],i)=>(
                <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" fill="#dde8f6" />
              ))}
              <g stroke="#fff" strokeLinecap="round" fill="none">
                <path d="M-2 28 L102 26" strokeWidth="3" />
                <path d="M-2 54 L102 56" strokeWidth="3" />
                <path d="M32 -2 L30 102" strokeWidth="3" />
                <path d="M58 -2 L60 102" strokeWidth="3" />
              </g>
              <path d="M30 90 C30 70 34 62 46 56 S60 40 60 26" stroke="#3374f6" strokeWidth="1.6" strokeDasharray="3 2.5" fill="none" strokeLinecap="round" />
            </svg>
            {[['22%', '30%', '₹30'], ['62%', '48%', '₹25'], ['44%', '70%', '₹20']].map(([l, t, p], i) => (
              <span
                key={i}
                style={{ left: l, top: t }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-navy-800 shadow-card ring-1 ring-navy-100"
              >
                <MapPin className="h-3 w-3 text-brand-600" /> {p}
              </span>
            ))}
            <span className="absolute left-[60%] top-[26%] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-navy-900 text-white shadow-card">
              <Car className="h-4 w-4" />
            </span>
          </div>

          <FloatingCard className="-left-2 bottom-12 w-52 animate-float sm:-left-6">
            <p className="text-xs font-semibold text-navy-500">Booking confirmed</p>
            <p className="mt-0.5 text-sm font-bold text-navy-900">Covered Garage Bay</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-navy-500">200 m away</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">₹30/hr</span>
            </div>
          </FloatingCard>
          <FloatingCard className="-right-1 top-6 animate-float [animation-delay:1.5s] sm:-right-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-navy-500">Owner payout</p>
                <p className="text-sm font-bold text-navy-900">₹18,450 / mo</p>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  )
}
