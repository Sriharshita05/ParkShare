// Loads the 6 sample parking spaces from the old mock data into MongoDB so the Find Parking page
// has something to show.
//
//   node src/db/seedSpaces.js owner@example.com
//   (or: npm run seed:spaces -- owner@example.com)
//
// The email must belong to an existing account registered as an "owner" (sign up with "List my space").
// All sample spaces are assigned to that owner. Running it again does not create duplicates.
import '../config/env.js'
import { connectDb, mongoose } from './connect.js'
import User from '../models/User.js'
import Space from '../models/Space.js'

const SAMPLE = [
  { title: 'Covered Garage Bay', type: 'Covered garage', address: 'Sector 17, Chandigarh', distanceM: 200, landmark: 'ABC Company', pricePerHour: 30, pricePerDay: 180, rating: 4.7, reviewCount: 128, spots: 2, window: '8:00 AM – 7:00 PM', amenities: ['CCTV', 'Covered', 'Gated', 'EV-ready'], vehicle: ['Car', 'SUV'], coords: { x: 34, y: 38 }, demand: 'high', tone: 'blue', verified: true },
  { title: 'Private Driveway', type: 'Driveway', address: 'Sector 22, Chandigarh', distanceM: 340, landmark: 'ABC Company', pricePerHour: 20, pricePerDay: 120, rating: 4.5, reviewCount: 64, spots: 1, window: '7:00 AM – 9:00 PM', amenities: ['CCTV', 'Easy access'], vehicle: ['Car'], coords: { x: 58, y: 24 }, demand: 'medium', tone: 'emerald', verified: true },
  { title: 'Society Basement Slot', type: 'Basement', address: 'Phase 3, Mohali', distanceM: 520, landmark: 'Tech Park', pricePerHour: 25, pricePerDay: 150, rating: 4.8, reviewCount: 212, spots: 6, window: '24 hours', amenities: ['Security guard', 'CCTV', 'Covered', 'Lift access'], vehicle: ['Car', 'SUV', 'Bike'], coords: { x: 72, y: 56 }, demand: 'low', tone: 'navy', verified: true },
  { title: 'Open Courtyard Space', type: 'Open lot', address: 'Sector 35, Chandigarh', distanceM: 780, landmark: 'City Market', pricePerHour: 15, pricePerDay: 90, rating: 4.2, reviewCount: 37, spots: 3, window: '6:00 AM – 10:00 PM', amenities: ['Open air', 'Easy access'], vehicle: ['Car', 'Bike'], coords: { x: 22, y: 66 }, demand: 'low', tone: 'emerald', verified: false },
  { title: 'Office Tower Visitor Bay', type: 'Corporate', address: 'Industrial Area Phase 1', distanceM: 910, landmark: 'Orion Hub', pricePerHour: 40, pricePerDay: 240, rating: 4.9, reviewCount: 305, spots: 12, window: '8:00 AM – 8:00 PM', amenities: ['Security guard', 'CCTV', 'Covered', 'EV-ready'], vehicle: ['Car', 'SUV'], coords: { x: 46, y: 78 }, demand: 'high', tone: 'blue', verified: true },
  { title: 'Home Garage, Quiet Lane', type: 'Covered garage', address: 'Sector 8, Chandigarh', distanceM: 1100, landmark: 'Rock Garden', pricePerHour: 22, pricePerDay: 130, rating: 4.6, reviewCount: 51, spots: 1, window: '9:00 AM – 6:00 PM', amenities: ['Covered', 'Gated'], vehicle: ['Car'], coords: { x: 82, y: 30 }, demand: 'medium', tone: 'navy', verified: true },
]

const email = (process.argv[2] || '').trim().toLowerCase()

async function main() {
  if (!email) {
    console.error('Usage: node src/db/seedSpaces.js owner@example.com')
    return 1
  }
  await connectDb()

  const owner = await User.findOne({ email })
  if (!owner) {
    console.error(`No account found for ${email}. Register it first (choose "List my space").`)
    return 1
  }
  if (owner.role !== 'owner') {
    console.error(`${email} is registered as "${owner.role}". Use an account registered as an owner.`)
    return 1
  }

  let created = 0
  for (const sample of SAMPLE) {
    const exists = await Space.exists({ owner: owner._id, title: sample.title })
    if (exists) continue
    await Space.create({ ...sample, owner: owner._id })
    created++
  }
  console.log(`Done. Added ${created} sample space(s) for ${email}; ${SAMPLE.length - created} already existed.`)
  return 0
}

main()
  .then((code) => mongoose.disconnect().finally(() => process.exit(code)))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
