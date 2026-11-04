// Creates the single admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
// If an admin already exists nothing is changed.
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { connectDb, mongoose } from './connect.js'
import User from '../models/User.js'

const { name, email, password } = env.admin
if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first (there is no default password).')
  process.exit(1)
}
if (password.length < 10) {
  console.error('ADMIN_PASSWORD must be at least 10 characters.')
  process.exit(1)
}

try {
  await connectDb()
  await User.init() // make sure indexes (unique email, single admin) exist
  const existing = await User.findOne({ role: 'admin' })
  if (existing) {
    console.log(`An admin already exists (${existing.email}). Nothing changed.`)
  } else {
    const passwordHash = await bcrypt.hash(password, 12)
    await User.create({ name, email, passwordHash, role: 'admin' })
    console.log(`Admin created: ${email.trim().toLowerCase()}`)
  }
} catch (err) {
  if (err.code === 11000) console.error('Cannot create admin: that email is already used by a normal account.')
  else console.error(`Could not reach MongoDB at your MONGODB_URI: ${err.message}`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
