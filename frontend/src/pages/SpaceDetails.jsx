import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BadgeCheck, Clock, Car, MapPin, ShieldCheck, Check } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Rating from '../components/ui/Rating'
import { useAuth } from '../context/AuthContext'
import { ApiError, getSpace, getReviews, createBooking } from '../services/api'
import { rupees, distance, PLATFORM_FEE_RATE } from '../utils/format'

const durations = [
  { id: 1, hours: 1 },
  { id: 2, hours: 2 },
  { id: 4, hours: 4 },
  { id: 8, hours: 8 },
  { id: 'day', hours: 24 },
]

export default function SpaceDetails() {
  const { t } = useTranslation()
  const durationLabel = (d) => (d.id === 'day' ? t('time.fullDay') : t('time.hours', { count: d.hours }))
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, ready } = useAuth()
  const [space, setSpace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState(durations[1])
  const [vehicle, setVehicle] = useState('Car')
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')

  // Guests can browse, but only logged-in drivers and owners can book. The admin cannot.
  const isGuest = ready && !user
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    setLoading(true)
    Promise.all([getSpace(id), getReviews(id)]).then(([s, r]) => {
      setSpace(s)
      setReviews(r)
      setLoading(false)
    })
  }, [id])

  const price = useMemo(() => {
    if (!space) return { base: 0, fee: 0, total: 0 }
    const base = duration.id === 'day' ? space.pricePerDay : space.pricePerHour * duration.hours
    const fee = Math.round(base * PLATFORM_FEE_RATE)
    return { base, fee, total: base + fee }
  }, [space, duration])

  // Send the visitor to login and bring them back to this page afterwards.
  const goToLogin = () => navigate('/auth', { state: { from: location.pathname } })

  const confirm = async () => {
    if (!ready) return
    if (!user) {
      goToLogin()
      return
    }
    if (isAdmin) {
      setError(t('space.adminCannotBook'))
      return
    }

    setBooking(true)
    setError('')
    try {
      // Payment (Razorpay test mode) will be opened here in a later phase.
      const b = await createBooking({ spaceId: space.id, hours: duration.hours, vehicle, total: price.total })
      navigate('/active', { state: { booking: b, space } })
    } catch (err) {
      // The server rejected the saved login (expired or invalid): ask the user to log in again.
      if (err instanceof ApiError && err.status === 401) {
        goToLogin()
        return
      }
      setError(err instanceof ApiError && err.message ? err.message : t('common.somethingWrong'))
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page grid animate-pulse gap-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="card h-96" />
        <div className="card h-96" />
      </div>
    )
  }

  if (!space) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">{t('space.notFound')}</h1>
        <Button to="/find" className="mt-6">{t('space.backToSearch')}</Button>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Link to="/find" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> {t('space.backToResults')}
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 sm:h-72">
              <div className="dot-grid absolute inset-0 opacity-20 invert" />
              <div className="relative flex h-28 w-48 items-end justify-center rounded-t-2xl border-x-4 border-t-4 border-white/30 bg-white/5 pb-3">
                <Car className="h-14 w-14 text-white" />
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-navy-800">{t(`spaceTypes.${space.type}`, space.type)}</span>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-navy-900">{space.title}</h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-navy-500">
                    <MapPin className="h-4 w-4" /> {space.address} · {t('space.distanceFrom', { distance: distance(space.distanceM), landmark: space.landmark })}
                  </p>
                </div>
                <Rating value={space.rating} count={space.reviews} size="md" />
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  [t('space.price'), t('space.perHour', { price: rupees(space.pricePerHour) })],
                  [t('space.available'), space.window === '24 hours' ? t('space.allDay') : space.window],
                  [t('space.spaceLabel'), t('space.cars', { count: space.spots })],
                  [t('space.dailyRate'), rupees(space.pricePerDay)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-surface p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-navy-500">{k}</dt>
                    <dd className="mt-1 text-sm font-bold text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                {space.amenities.map((a) => (
                  <Badge key={a} tone="navy" icon={Check}>{t(`amenities.${a}`, a)}</Badge>
                ))}
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold">{t('space.hostedBy')}</h2>
            <div className="mt-4 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-navy-800 font-bold text-white">
                {space.owner.name[0]}
              </span>
              <div>
                <p className="font-semibold text-navy-900">{space.owner.name}</p>
                {space.owner.verified ? (
                  <Badge tone="green" icon={BadgeCheck}>{t('space.verifiedOwner')}</Badge>
                ) : (
                  <Badge tone="amber">{t('space.pendingVerification')}</Badge>
                )}
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold">{t('space.reviews')}</h2>
            <ul className="mt-4 divide-y divide-navy-50">
              {reviews.map((r) => (
                <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-navy-900">{r.name}</span>
                    <span className="text-xs text-navy-400">{r.when}</span>
                  </div>
                  <div className="mt-1"><Rating value={r.rating} /></div>
                  <p className="mt-2 text-sm leading-relaxed text-navy-600">{r.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Booking panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6 shadow-card">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-bold">{t('space.bookThisSpace')}</h2>
              <span className="font-display text-2xl font-extrabold text-brand-700">
                {rupees(space.pricePerHour)}<span className="text-sm font-medium text-navy-500">{t('space.perHour', { price: '' })}</span>
              </span>
            </div>

            <fieldset className="mt-5">
              <legend className="label">{t('space.duration')}</legend>
              <div className="grid grid-cols-3 gap-2">
                {durations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d)}
                    aria-pressed={duration.id === d.id}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                      duration.id === d.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                        : 'border-navy-200 text-navy-700 hover:border-brand-300'
                    }`}
                  >
                    {durationLabel(d)}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5">
              <label htmlFor="vehicle" className="label">{t('space.vehicle')}</label>
              <select id="vehicle" className="input" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                {space.vehicle.map((v) => <option key={v} value={v}>{t(`vehicles.${v}`, v)}</option>)}
              </select>
            </div>

            <dl className="mt-6 space-y-2.5 border-t border-navy-100 pt-5 text-sm">
              <div className="flex justify-between text-navy-600">
                <dt>{t('space.parkingFor', { duration: durationLabel(duration) })}</dt><dd className="font-semibold text-navy-900">{rupees(price.base)}</dd>
              </div>
              <div className="flex justify-between text-navy-600">
                <dt>{t('space.platformFee', { percent: Math.round(PLATFORM_FEE_RATE * 100) })}</dt><dd className="font-semibold text-navy-900">{rupees(price.fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-navy-200 pt-3 text-base">
                <dt className="font-bold">{t('space.total')}</dt><dd className="font-display text-xl font-extrabold text-navy-900">{rupees(price.total)}</dd>
              </div>
            </dl>

            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <Button size="lg" className="mt-5 w-full" onClick={confirm} loading={booking}>
              {booking ? t('space.confirming') : isGuest ? t('space.loginToBook') : t('space.bookNow', { amount: rupees(price.total) })}
            </Button>
            {isGuest && (
              <p className="mt-3 text-center text-xs text-navy-500">
                {t('space.browseNote')}
              </p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-navy-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {t('space.secureCheckout')}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-navy-400">
              <Clock className="h-3.5 w-3.5" /> {t('space.freeCancel')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}