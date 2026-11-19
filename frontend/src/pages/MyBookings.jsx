import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Car, MapPin, ReceiptText } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { getMyBookings } from '../services/api'
import { rupees } from '../utils/format'

const PHASES = {
  active: { label: 'In progress', tone: 'green' },
  upcoming: { label: 'Upcoming', tone: 'amber' },
  completed: { label: 'Completed', tone: 'navy' },
  cancelled: { label: 'Cancelled', tone: 'navy' },
}

const SECTIONS = [
  { id: 'active', title: 'Active now', phases: ['active'] },
  { id: 'upcoming', title: 'Upcoming', phases: ['upcoming'] },
  { id: 'past', title: 'Past bookings', phases: ['completed', 'cancelled'] },
]

const formatTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function phaseOf(booking, now) {
  if (booking.status === 'cancelled') return 'cancelled'
  if (now < +new Date(booking.startTime)) return 'upcoming'
  if (now < +new Date(booking.endTime)) return 'active'
  return 'completed'
}

function BookingCard({ booking, phase }) {
  const { label, tone } = PHASES[phase]
  const space = booking.space // missing if the space was deleted after the booking
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {space ? (
            <Link to={`/space/${space.id}`} className="font-bold text-navy-900 hover:text-brand-700 hover:underline">
              {space.title}
            </Link>
          ) : (
            <span className="font-bold text-navy-900">Removed space</span>
          )}
          {space?.address && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-navy-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {space.address}
            </p>
          )}
        </div>
        <Badge tone={tone}>{label}</Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
            <CalendarClock className="h-3.5 w-3.5" /> When
          </dt>
          <dd className="mt-1 font-semibold text-navy-900">
            {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
            <Car className="h-3.5 w-3.5" /> Vehicle
          </dt>
          <dd className="mt-1 font-semibold text-navy-900">
            {booking.vehicle} · {booking.hours === 24 ? 'Full day' : `${booking.hours} hr${booking.hours === 1 ? '' : 's'}`}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
            <ReceiptText className="h-3.5 w-3.5" /> Total
          </dt>
          <dd className="mt-1 font-semibold text-navy-900">{rupees(booking.total)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-navy-400">Booking ID {booking.id}</p>
    </li>
  )
}

function Sections({ bookings, now }) {
  const withPhase = useMemo(() => bookings.map((b) => ({ booking: b, phase: phaseOf(b, now) })), [bookings, now])

  return SECTIONS.map((section) => {
    const items = withPhase
      .filter((x) => section.phases.includes(x.phase))
      .sort((a, b) =>
        section.id === 'upcoming'
          ? +new Date(a.booking.startTime) - +new Date(b.booking.startTime)
          : +new Date(b.booking.startTime) - +new Date(a.booking.startTime)
      )
    if (items.length === 0) return null
    return (
      <section key={section.id} className="mt-8 first:mt-0">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-500">
          {section.title} <span className="text-navy-400">({items.length})</span>
        </h2>
        <ul className="space-y-3">
          {items.map(({ booking, phase }) => (
            <BookingCard key={booking.id} booking={booking} phase={phase} />
          ))}
        </ul>
      </section>
    )
  })
}

export default function MyBookings() {
  const [bookings, setBookings] = useState(null) // null = still loading
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getMyBookings()
      .then((list) => alive && setBookings(list))
      .catch((err) => alive && setError(err.message || 'Could not load your bookings. Please try again.'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">My bookings</h1>
        <Button to="/find" variant="secondary" size="sm">
          Find parking
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && bookings === null && (
        <div className="animate-pulse space-y-3" aria-label="Loading your bookings">
          <div className="card h-32" />
          <div className="card h-32" />
        </div>
      )}

      {!error && bookings !== null && bookings.length === 0 && (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Car className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold">No bookings yet</h2>
          <p className="mt-1 text-sm text-navy-500">When you book a parking space, it will show up here.</p>
          <Button to="/find" className="mt-6">
            Find parking
          </Button>
        </div>
      )}

      {!error && bookings !== null && bookings.length > 0 && <Sections bookings={bookings} now={Date.now()} />}
    </div>
  )
}