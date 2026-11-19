import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // public id, e.g. "BK-4F2A91"
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // copied from the space for fast dashboard queries
    vehicle: { type: String, required: true },
    hours: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    base: { type: Number, required: true }, // what the owner earns
    fee: { type: Number, required: true }, // platform fee
    total: { type: Number, required: true }, // what the driver pays
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
)

// Speeds up the "is this slot free?" check.
bookingSchema.index({ space: 1, startTime: 1, endTime: 1 })

// Same shape the old mock createBooking returned ({ id, status, spaceId, hours, vehicle, total }), plus extras.
export function bookingToClient(booking) {
  const space = booking.space
  const populated = space && typeof space === 'object' && space.title !== undefined
  return {
    id: booking.code,
    status: booking.status,
    spaceId: String(populated ? space._id : space),
    ...(populated ? { space: { id: String(space._id), title: space.title, address: space.address } } : {}),
    hours: booking.hours,
    vehicle: booking.vehicle,
    base: booking.base,
    fee: booking.fee,
    total: booking.total,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
  }
}

export default mongoose.model('Booking', bookingSchema)
