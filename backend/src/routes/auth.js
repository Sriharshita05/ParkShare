import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const router = Router()

const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(255)
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password must be at most 72 characters.'),
  // 'admin' is deliberately not accepted: the only admin is created by the seed script.
  role: z.enum(['driver', 'owner'], { error: 'Choose whether you want to find parking or list a space.' }).default('driver'),
})
const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.').max(72),
  remember: z.boolean().optional().default(false),
})

const parse = (schema, body, res) => {
  const result = schema.safeParse(body)
  if (!result.success) {
    res.status(422).json({ detail: result.error.issues[0].message })
    return null
  }
  return result.data
}

// Slow down password guessing and signup spam.
const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { detail: 'Too many attempts. Please wait a few minutes and try again.' },
  })

// A real hash to compare against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12)

router.post('/register', limiter(20), async (req, res, next) => {
  const data = parse(registerSchema, req.body, res)
  if (!data) return
  try {
    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await User.create({ name: data.name, email: data.email, passwordHash, role: data.role })
    res.status(201).json({ token: signToken(user), user: user.toPublic() })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ detail: 'An account with this email already exists. Try logging in.' })
    next(err)
  }
})

router.post('/login', limiter(10), async (req, res, next) => {
  const data = parse(loginSchema, req.body, res)
  if (!data) return
  try {
    const user = await User.findOne({ email: data.email }).select('+passwordHash')
    const ok = await bcrypt.compare(data.password, user ? user.passwordHash : DUMMY_HASH)
    if (!user || !ok) return res.status(401).json({ detail: 'Incorrect email or password.' })
    user.lastLoginAt = new Date()
    await user.save()
    res.json({ token: signToken(user, data.remember), user: user.toPublic() })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.auth.id)) return res.status(401).json({ detail: 'Your session is invalid. Please log in again.' })
    const user = await User.findById(req.auth.id)
    if (!user) return res.status(401).json({ detail: 'Your account no longer exists.' })
    res.json({ user: user.toPublic() })
  } catch (err) {
    next(err)
  }
})

// Email delivery is not set up yet, so no reset link is sent. The reply is identical whether or not
// the email exists, so this endpoint cannot be used to discover registered addresses.
router.post('/forgot-password', limiter(5), (req, res) => {
  const data = parse(z.object({ email }), req.body, res)
  if (!data) return
  res.json({ message: 'If an account exists for that email, reset instructions will be sent once email delivery is enabled.' })
})

export default router
