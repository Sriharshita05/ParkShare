import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Car, MapPin, Navigation, CheckCircle2, ReceiptText } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { spaces } from '../data/mockData'
import { clock, rupees } from '../utils/format'

export default function ActiveParking() {
  const { state } = useLocation()
  // Falls back to a sample session so the screen is always demoable.
  const space = state?.space || spaces[0]
  const [seconds, setSeconds] = useState(2 * 3600 + 15 * 60 + 30)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    if (ended) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [ended])

  const cost = Math.max(space.pricePerHour, Math.ceil((seconds / 3600) * space.pricePerHour))
  const fee = Math.round(cost * 0.1)

  if (ended) {
    return (
      <div className="container-page max-w-lg py-16">
        <div className="card animate-fade-up p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold">Parking complete</h1>
          <p className="mt-1 text-sm text-navy-500">Thanks for parking with ParkShare.</p>
          <dl className="mt-6 space-y-2 rounded-xl bg-surface p-4 text-left text-sm">
            <div className="flex justify-between"><dt className="text-navy-600">Duration</dt><dd className="font-semibold">{clock(seconds)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-600">Parking charge</dt><dd className="font-semibold">{rupees(cost)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-600">Platform fee</dt><dd className="font-semibold">{rupees(fee)}</dd></div>
            <div className="flex justify-between border-t border-dashed border-navy-200 pt-2 text-base"><dt className="font-bold">Total paid</dt><dd className="font-extrabold">{rupees(cost + fee)}</dd></div>
          </dl>
          <div className="mt-6 flex gap-3">
            <Button to="/find" className="flex-1">Find more parking</Button>
            <Button to="/" variant="secondary" className="flex-1">Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Active parking</h1>
        <Badge tone="green"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> In progress</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        <section className="card relative overflow-hidden p-8 text-center md:col-span-3">
          <div className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="relative">
            <span className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-400/40" />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                <Car className="h-9 w-9" />
              </span>
            </span>
            <p className="mt-6 font-display text-5xl font-extrabold tabular-nums tracking-tight text-navy-900" role="timer" aria-live="off">
              {clock(seconds)}
            </p>
            <p className="mt-2 text-sm text-navy-500">Started at 10:00 AM</p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-navy-500">Running cost</p>
            <p className="font-display text-3xl font-extrabold text-brand-700">{rupees(cost)}</p>
            <Button variant="primary" size="lg" className="mt-8 w-full" onClick={() => setEnded(true)}>
              End parking
            </Button>
          </div>
        </section>

        <section className="card p-6 md:col-span-2">
          <h2 className="font-bold">{space.title}</h2>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-navy-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {space.address}
          </p>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-navy-500">Rate</dt><dd className="font-semibold">{rupees(space.pricePerHour)}/hr</dd></div>
            <div className="flex justify-between"><dt className="text-navy-500">Window</dt><dd className="font-semibold">{space.window}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-500">Owner</dt><dd className="font-semibold">{space.owner.name}</dd></div>
          </dl>
          <div className="mt-5 grid gap-2">
            <Button variant="secondary" size="sm" icon={Navigation}>Get directions</Button>
            <Button variant="ghost" size="sm" icon={ReceiptText}>View booking</Button>
          </div>
          <Link to="/find" className="mt-4 block text-center text-xs font-semibold text-brand-700 hover:underline">
            Browse other spaces
          </Link>
        </section>
      </div>
    </div>
  )
}
