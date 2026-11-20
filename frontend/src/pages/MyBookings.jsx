import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Car, MapPin, ReceiptText } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { getMyBookings } from '../services/api'
import { rupees } from '../utils/format'
import { localeOf } from '../i18n'

const PHASES = {
  active: { label: 'bookings.phaseActive', tone: 'green' }, // labels are translation keys
  upcoming: { label: 'bookings.phaseUpcoming', tone: 'amber' },
  completed: { label: 'bookings.phaseCompleted', tone: 'navy' },
  cancelled: { label: 'bookings.phaseCancelled', tone: 'navy' },
}

const SECTIONS = [
  { id: 'active', title: 'bookings.sectionActive', phases: ['active'] },
  { id: 'upcoming', title: 'bookings.sectionUpcoming', phases: ['upcoming'] },
  { id: 'past', title: 'bookings.sectionPast', phases: ['completed', 'cancelled'] },
]

const formatTime = (iso) =>
  new Date(iso).toLocaleString(localeOf(), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function phaseOf(booking, now) {
  if (booking.status === 'cancelled') return 'cancelled'
  if (now < +new Date(booking.startTime)) return 'upcoming'
  if (now < +new Date(booking.endTime)) return 'active'
  return 'completed'
}

function BookingCard({ booking, phase }) {
  const { t } = useTranslation()
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
            <span className="font-bold text-navy-900">{t('bookings.removedSpace')}</span>
          )}
          {space?.address && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-navy-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {space.address}
            </p>
          )}
        </div>
        <Badge tone={tone}>{t(label)}</Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
            <CalendarClock className="h-3.5 w-3.5" /> {t('bookings.when')}
          </dt>
          <dd className="mt-1 font-semibold text-navy-900">
            {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
            <Car className="h-3.5 w-3.5" /> {t('bookings.vehicle')}
          </dt>
          <dd className="mt-1 font-semibold text-navy-900">
            {t(`vehicles.${booking.vehicle}`, booking.vehicle)} · {booking.hours === 24 ? t('time.fullDay') : t('time.hours', { count: booking.hours })}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-500">
            <ReceiptText className="h-3.5 w-3.5" /> {t('bookings.total')}
          </dt>
          <dd className="mt-1 font-semibold text-navy-900">{rupees(booking.total)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-navy-400">{t('bookings.bookingId', { id: booking.id })}</p>
    </li>
  )
}

function Sections({ bookings, now }) {
  const { t } = useTranslation()
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
          {t(section.title)} <span className="text-navy-400">({items.length})</span>
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
  const { t } = useTranslation()
  const [bookings, setBookings] = useState(null) // null = still loading
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getMyBookings()
      .then((list) => alive && setBookings(list))
      .catch((err) => alive && setError(err.message || t('bookings.loadError')))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">{t('bookings.title')}</h1>
        <Button to="/find" variant="secondary" size="sm">
          {t('bookings.findParking')}
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && bookings === null && (
        <div className="animate-pulse space-y-3" aria-label={t('bookings.loading')}>
          <div className="card h-32" />
          <div className="card h-32" />
        </div>
      )}

      {!error && bookings !== null && bookings.length === 0 && (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Car className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold">{t('bookings.emptyTitle')}</h2>
          <p className="mt-1 text-sm text-navy-500">{t('bookings.emptyText')}</p>
          <Button to="/find" className="mt-6">
            {t('bookings.findParking')}
          </Button>
        </div>
      )}

      {!error && bookings !== null && bookings.length > 0 && <Sections bookings={bookings} now={Date.now()} />}
    </div>
  )
}