import { Router } from 'express'
import Space from '../models/Space.js'
import Booking from '../models/Booking.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { wrap } from '../utils/asyncHandler.js'
import { DAY_MS, shortName, startOfDay, startOfMonth, weekday, whenLabel } from '../utils/istTime.js'

const router = Router()

const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0)

function phase(booking, now) {
  if (booking.status === 'cancelled') return 'Cancelled'
  if (now < +booking.startTime) return 'Upcoming'
  if (now < +booking.endTime) return 'Active'
  return 'Completed'
}

// GET /api/owner/dashboard : the numbers behind the owner dashboard page.
// Same shape as the mock: { stats, series, listings, bookings }. The admin also lands on this page,
// so the admin gets an empty dashboard instead of an error.
router.get(
  '/dashboard',
  requireAuth,
  requireRole('owner', 'admin'),
  wrap(async (req, res) => {
    const now = Date.now()
    const monthStart = startOfMonth(now)
    const prevMonthStart = startOfMonth(now, -1)
    const todayStart = startOfDay(now)
    const weekStart = todayStart - 6 * DAY_MS

    const [spaces, bookings] = await Promise.all([
      Space.find({ owner: req.auth.id }).lean(),
      Booking.find({ owner: req.auth.id, startTime: { $gte: new Date(prevMonthStart) } })
        .populate('driver', 'name')
        .lean(),
    ])

    const live = bookings.filter((b) => b.status === 'confirmed') // cancelled bookings earn nothing
    const thisMonth = live.filter((b) => +b.startTime >= monthStart)
    const lastMonthEarnings = sum(
      live.filter((b) => +b.startTime < monthStart),
      (b) => b.base
    )
    const earningsMonth = sum(thisMonth, (b) => b.base)

    // Earnings for each of the last 7 days (India time), oldest first.
    const series = Array.from({ length: 7 }, (_, i) => {
      const dayStart = todayStart - (6 - i) * DAY_MS
      const value = sum(
        live.filter((b) => +b.startTime >= dayStart && +b.startTime < dayStart + DAY_MS),
        (b) => b.base
      )
      return { label: weekday(dayStart), value }
    })

    // Occupancy: booked hours in the last 7 days as a share of all spot-hours (24h a day) on active listings.
    const capacityHours = sum(
      spaces.filter((s) => s.status === 'active'),
      (s) => s.spots * 24 * 7
    )
    const bookedHours = sum(
      live.filter((b) => +b.startTime >= weekStart),
      (b) => b.hours
    )
    const occupancy = capacityHours ? Math.min(100, Math.round((bookedHours / capacityHours) * 100)) : 0

    const ratedCount = sum(spaces, (s) => s.reviewCount || 0)
    const rating = ratedCount ? Math.round((sum(spaces, (s) => (s.rating || 0) * (s.reviewCount || 0)) / ratedCount) * 10) / 10 : 0

    const listings = spaces.map((s) => {
      const mine = thisMonth.filter((b) => String(b.space) === String(s._id))
      return {
        id: String(s._id),
        title: s.title,
        status: s.status === 'active' ? 'Active' : 'Paused',
        price: s.pricePerHour,
        bookings: mine.length,
        earnings: sum(mine, (b) => b.base),
      }
    })

    const titleById = new Map(spaces.map((s) => [String(s._id), s.title]))
    const recent = [...bookings]
      .sort((a, b) => +b.startTime - +a.startTime)
      .slice(0, 8)
      .map((b) => ({
        id: b.code,
        driver: shortName(b.driver?.name),
        space: titleById.get(String(b.space)) || 'Removed space',
        when: whenLabel(+b.startTime, +b.endTime, now),
        amount: b.base,
        status: phase(b, now),
      }))

    res.json({
      stats: {
        earningsMonth,
        earningsDelta: lastMonthEarnings ? Math.round(((earningsMonth - lastMonthEarnings) / lastMonthEarnings) * 1000) / 10 : 0,
        bookingsMonth: thisMonth.length,
        occupancy,
        rating,
      },
      series,
      listings,
      bookings: recent,
    })
  })
)

export default router
