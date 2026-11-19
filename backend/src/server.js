import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { connectDb, mongoose } from './db/connect.js'
import User from './models/User.js'
import authRoutes from './routes/auth.js'
import otpRoutes from './routes/otp.js'
import chatRoutes from './routes/chat.js'
import spaceRoutes from './routes/spaces.js'
import bookingRoutes from './routes/bookings.js'
import ownerRoutes from './routes/owner.js'
import { requireVerifiedEmail } from './middleware/requireVerifiedEmail.js'

const app = express()
app.disable('x-powered-by')
// Behind a hosting proxy (Render, Railway...) this makes rate limiting see the real client IP.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY))
// PATCH and DELETE are needed for editing and deleting spaces; without them the browser blocks those requests.
app.use(cors({ origin: env.clientOrigin.split(','), methods: ['GET', 'POST', 'PATCH', 'DELETE'] }))
app.use(express.json({ limit: '50kb' })) // changed from 10kb so chat history fits

app.get('/api/health', (_req, res) => {
  const up = mongoose.connection.readyState === 1
  res.status(up ? 200 : 503).json({ status: up ? 'ok' : 'database unavailable' })
})

// Signup email verification. Order matters:
//  1. /api/auth/send-otp and /api/auth/verify-otp
//  2. the gate that blocks POST /api/auth/register unless the email was verified
//  3. your existing auth routes (login, register, ...)
app.use('/api/auth', otpRoutes)
app.post('/api/auth/register', requireVerifiedEmail)
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/spaces', spaceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/owner', ownerRoutes)

app.use((_req, res) => res.status(404).json({ detail: 'Not found.' }))
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ detail: 'Invalid request body.' })
  console.error(err)
  res.status(500).json({ detail: 'Something went wrong on our side. Please try again.' })
})

try {
  await connectDb()
  await User.init() // build indexes (unique email, single admin) before accepting requests
  console.log('Connected to MongoDB.')
} catch (err) {
  console.error(`Could not connect to MongoDB. Is it running, and is MONGODB_URI correct?\n${err.message}`)
  process.exit(1)
}

app.listen(env.port, () => console.log(`ParkShare API listening on http://localhost:${env.port}`))