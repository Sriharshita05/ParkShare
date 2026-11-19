import { Router } from 'express'
import Space, { AMENITIES, SPACE_TYPES, VEHICLES, spaceToClient } from '../models/Space.js'
import Booking from '../models/Booking.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { isObjectId, wrap } from '../utils/asyncHandler.js'

const router = Router()

// Fields an owner may send. Everything else (owner, verified, rating...) is set by the server.
const EDITABLE = ['title', 'type', 'address', 'landmark', 'distanceM', 'pricePerHour', 'pricePerDay', 'spots', 'window', 'amenities', 'vehicle']

const LABELS = {
  title: 'Title',
  type: 'Space type',
  address: 'Address',
  landmark: 'Landmark',
  distanceM: 'Distance',
  pricePerHour: 'Hourly price',
  pricePerDay: 'Daily price',
  spots: 'Number of spots',
  window: 'Availability',
  amenities: 'Amenities',
  vehicle: 'Vehicle types',
  status: 'Status',
}

const pick = (body, keys) => Object.fromEntries(keys.filter((k) => body?.[k] !== undefined).map((k) => [k, body[k]]))
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Turns a Mongoose validation error into one friendly sentence for the { detail } error format.
function validationDetail(err) {
  const first = Object.values(err.errors || {})[0]
  if (!first) return 'Please check the details and try again.'
  const label = LABELS[String(first.path).split('.')[0]] || first.path
  if (first.kind === 'required') return `${label} is required.`
  if (first.name === 'CastError' || first.kind === 'enum') return `${label} is not valid.`
  if (first.kind === 'min' || first.kind === 'minlength') return `${label} is too low or too short.`
  if (first.kind === 'max' || first.kind === 'maxlength') return `${label} is too high or too long.`
  return first.message
}

async function loadOwnedSpace(req, res) {
  if (!isObjectId(req.params.id)) {
    res.status(404).json({ detail: 'Space not found.' })
    return null
  }
  const space = await Space.findById(req.params.id)
  if (!space) {
    res.status(404).json({ detail: 'Space not found.' })
    return null
  }
  if (String(space.owner) !== req.auth.id) {
    res.status(403).json({ detail: 'You can only change your own spaces.' })
    return null
  }
  return space
}

// ---- Public: search and details ---------------------------------------------------------------
// GET /api/spaces?q=sector&vehicle=Car&type=Basement&maxPrice=30&amenity=CCTV,Covered
router.get(
  '/',
  wrap(async (req, res) => {
    const { q, vehicle, type, maxPrice, amenity } = req.query
    const filter = { status: 'active' }

    if (typeof q === 'string' && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim().slice(0, 60)), 'i')
      filter.$or = [{ title: rx }, { address: rx }, { landmark: rx }]
    }
    if (VEHICLES.includes(vehicle)) filter.vehicle = vehicle
    if (SPACE_TYPES.includes(type)) filter.type = type
    const max = Number(maxPrice)
    if (Number.isFinite(max) && max > 0) filter.pricePerHour = { $lte: max }
    if (typeof amenity === 'string') {
      const wanted = amenity.split(',').filter((a) => AMENITIES.includes(a))
      if (wanted.length) filter.amenities = { $all: wanted }
    }

    const spaces = await Space.find(filter).populate('owner', 'name').sort({ distanceM: 1, createdAt: -1 }).limit(100)
    res.json(spaces.map(spaceToClient))
  })
)

// Must be declared before "/:id", otherwise "mine" would be treated as an id.
router.get(
  '/mine',
  requireAuth,
  requireRole('owner'),
  wrap(async (req, res) => {
    const spaces = await Space.find({ owner: req.auth.id }).populate('owner', 'name').sort({ createdAt: -1 })
    res.json(spaces.map(spaceToClient))
  })
)

router.get(
  '/:id',
  wrap(async (req, res) => {
    if (!isObjectId(req.params.id)) return res.status(404).json({ detail: 'Space not found.' })
    const space = await Space.findById(req.params.id).populate('owner', 'name')
    if (!space) return res.status(404).json({ detail: 'Space not found.' })
    res.json(spaceToClient(space))
  })
)

// Reviews are a later feature; the page just needs a list.
router.get('/:id/reviews', (_req, res) => res.json([]))

// ---- Owner: create, edit, delete --------------------------------------------------------------
router.post(
  '/',
  requireAuth,
  requireRole('owner'),
  wrap(async (req, res) => {
    const space = new Space({ ...pick(req.body, EDITABLE), owner: req.auth.id })
    try {
      await space.validate()
    } catch (err) {
      if (err.name === 'ValidationError') return res.status(400).json({ detail: validationDetail(err) })
      throw err
    }
    await space.save()
    await space.populate('owner', 'name')
    res.status(201).json(spaceToClient(space))
  })
)

router.patch(
  '/:id',
  requireAuth,
  requireRole('owner'),
  wrap(async (req, res) => {
    const space = await loadOwnedSpace(req, res)
    if (!space) return
    Object.assign(space, pick(req.body, [...EDITABLE, 'status'])) // status: 'active' | 'paused'
    try {
      await space.save()
    } catch (err) {
      if (err.name === 'ValidationError') return res.status(400).json({ detail: validationDetail(err) })
      throw err
    }
    await space.populate('owner', 'name')
    res.json(spaceToClient(space))
  })
)

router.delete(
  '/:id',
  requireAuth,
  requireRole('owner'),
  wrap(async (req, res) => {
    const space = await loadOwnedSpace(req, res)
    if (!space) return
    const live = await Booking.exists({ space: space._id, status: 'confirmed', endTime: { $gt: new Date() } })
    if (live) return res.status(409).json({ detail: 'This space has active or upcoming bookings. Pause it instead of deleting it.' })
    await space.deleteOne()
    res.json({ message: 'Space deleted.' })
  })
)

export default router
