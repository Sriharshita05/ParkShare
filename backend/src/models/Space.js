import mongoose from 'mongoose'

export const SPACE_TYPES = ['Covered garage', 'Driveway', 'Basement', 'Open lot', 'Corporate']
export const VEHICLES = ['Car', 'SUV', 'Bike']
export const AMENITIES = ['CCTV', 'Covered', 'Gated', 'EV-ready', 'Easy access', 'Security guard', 'Lift access', 'Open air']

const randomPercent = () => Math.round(10 + Math.random() * 80)

const spaceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
    type: { type: String, enum: SPACE_TYPES, required: true },
    address: { type: String, required: true, trim: true, maxlength: 160 },
    landmark: { type: String, required: true, trim: true, maxlength: 80 }, // nearby landmark shown as "X m from <landmark>"
    distanceM: { type: Number, required: true, min: 0, max: 50000 }, // distance from that landmark, in metres
    pricePerHour: { type: Number, required: true, min: 1, max: 100000 },
    pricePerDay: { type: Number, required: true, min: 1, max: 1000000 },
    spots: {
      type: Number,
      required: true,
      min: 1,
      max: 500,
      validate: { validator: Number.isInteger, message: 'Spots must be a whole number.' },
    },
    window: { type: String, trim: true, maxlength: 40, default: '24 hours' }, // display text, e.g. "8:00 AM – 7:00 PM"
    amenities: { type: [{ type: String, enum: AMENITIES }], default: [] },
    vehicle: {
      type: [{ type: String, enum: VEHICLES }],
      validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: 'Choose at least one vehicle type.' },
    },
    // Position of the pin on the placeholder map (percent). Replace with real lat/lng when you add Google Maps/Mapbox.
    coords: {
      x: { type: Number, min: 0, max: 100, default: randomPercent },
      y: { type: Number, min: 0, max: 100, default: randomPercent },
    },
    status: { type: String, enum: ['active', 'paused'], default: 'active', index: true },
    verified: { type: Boolean, default: false }, // set by the admin later (listing approval)
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    demand: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    tone: { type: String, enum: ['blue', 'emerald', 'navy'], default: 'blue' },
  },
  { timestamps: true }
)

// Same shape as the objects in frontend/src/data/mockData.js, so the existing pages work unchanged.
export function spaceToClient(space) {
  const owner = space.owner
  const populated = owner && typeof owner === 'object' && owner.name !== undefined
  return {
    id: String(space._id),
    ownerId: String(populated ? owner._id : owner),
    title: space.title,
    type: space.type,
    owner: { name: populated ? owner.name : 'Host', verified: Boolean(space.verified) },
    address: space.address,
    distanceM: space.distanceM,
    landmark: space.landmark,
    pricePerHour: space.pricePerHour,
    pricePerDay: space.pricePerDay,
    rating: space.rating,
    reviews: space.reviewCount,
    spots: space.spots,
    window: space.window,
    amenities: space.amenities,
    vehicle: space.vehicle,
    coords: { x: space.coords?.x ?? 50, y: space.coords?.y ?? 50 },
    demand: space.demand,
    tone: space.tone,
    status: space.status,
  }
}

export default mongoose.model('Space', spaceSchema)
