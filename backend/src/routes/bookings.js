import crypto from 'node:crypto'
import { Router } from 'express'
import Space from '../models/Space.js'
import Booking, { bookingToClient } from '../models/Booking.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { isObjectId, wrap } from '../utils/asyncHandler.js'
import { BOOKABLE_HOURS, priceFor } from '../utils/pricing.js'

const router = Router()

// Short public booking id such as "BK-4F2A91". Retries on the (very rare) duplicate.
async function createWithCode(data) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await Booking.create({ ...data, code: `BK-${crypto.randomBytes(3).toString('hex').toUpperCase()}` })
    } catch (err) {
      if (err?.code !== 11000) throw err
    }
  }
  throw new Error('Could not generate a booking code.')
}

// POST /api/bookings  { spaceId, hours, vehicle }
// Guests get 401 (requireAuth). The admin gets 403 (requireRole). Drivers and owners can book.
router.post(
  '/',
  requireAuth,
  requireRole('driver', 'owner'),
  wrap(async (req, res) => {
    const { spaceId, hours, vehicle } = req.body || {}
    const h = Number(hours)

    if (!BOOKABLE_HOURS.includes(h)) return res.status(400).json({ detail: 'Please choose a valid duration.' })
    if (!isObjectId(spaceId)) return res.status(404).json({ detail: 'Space not found.' })

    const space = await Space.findById(spaceId)
    if (!space) return res.status(404).json({ detail: 'Space not found.' })
    if (space.status !== 'active') return res.status(409).json({ detail: 'This space is not accepting bookings right now.' })
    if (String(space.owner) === req.auth.id) return res.status(403).json({ detail: 'You cannot book your own space.' })
    if (typeof vehicle !== 'string' || !space.vehicle.includes(vehicle)) {
      return res.status(400).json({ detail: 'Please choose a vehicle type this space accepts.' })
    }

    // The booking starts now and lasts `hours` (a date/time picker comes later).
    const start = new Date()
    const end = new Date(start.getTime() + h * 60 * 60 * 1000)

    // How many confirmed bookings overlap this time range? If every spot is taken, reject.
    // Every existing booking started at or before "now", so any booking that overlaps [start, end)
    // is using a spot right now, and this count is exact. When you add future bookings with a
    // date picker, replace it with a check of the busiest moment inside the range.
    const taken = await Booking.countDocuments({
      space: space._id,
      status: 'confirmed',
      startTime: { $lt: end },
      endTime: { $gt: start },
    })
    if (taken >= space.spots) {
      return res.status(409).json({ detail: 'This space is fully booked right now. Please try another space.' })
    }

    // Price is calculated here; any "total" sent by the browser is ignored.
    const { base, fee, total } = priceFor(space, h)

    const booking = await createWithCode({
      space: space._id,
      driver: req.auth.id,
      owner: space.owner,
      vehicle,
      hours: h,
      startTime: start,
      endTime: end,
      base,
      fee,
      total,
    })
    res.status(201).json(bookingToClient(booking))
  })
)

// GET /api/bookings/mine : the logged-in user's own bookings, newest first.
router.get(
  '/mine',
  requireAuth,
  wrap(async (req, res) => {
    const bookings = await Booking.find({ driver: req.auth.id }).populate('space', 'title address').sort({ createdAt: -1 }).limit(50)
    res.json(bookings.map(bookingToClient))
  })
)

export default router
