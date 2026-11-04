import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { connectDb, mongoose } from './db/connect.js'
import User from './models/User.js'
import authRoutes from './routes/auth.js'

const app = express()
app.disable('x-powered-by')
// Behind a hosting proxy (Render, Railway...) this makes rate limiting see the real client IP.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY))
app.use(cors({ origin: env.clientOrigin.split(','), methods: ['GET', 'POST'] }))
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_req, res) => {
  const up = mongoose.connection.readyState === 1
  res.status(up ? 200 : 503).json({ status: up ? 'ok' : 'database unavailable' })
})

app.use('/api/auth', authRoutes)

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
