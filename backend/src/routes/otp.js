import crypto from 'node:crypto'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import User from '../models/User.js'
import EmailOtp from '../models/EmailOtp.js'
import { wrap } from '../utils/asyncHandler.js'
import { mailConfigured, sendOtpEmail } from '../utils/mailer.js'
import {
  MAX_ATTEMPTS,
  MAX_SENDS_PER_HOUR,
  OTP_TTL_MS,
  RESEND_COOLDOWN_S,
  WINDOW_MS,
  generateOtp,
  hashOtp,
  normalizeEmail,
  otpMatches,
  signVerificationToken,
} from '../utils/otp.js'

const router = Router()

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// For local testing without SMTP: prints the OTP in the backend terminal instead of emailing it.
// Needs OTP_DEV_LOG=true in .env and is ignored when NODE_ENV=production.
const devLogEnabled = () => process.env.OTP_DEV_LOG === 'true' && process.env.NODE_ENV !== 'production'

// Extra protection per IP address, on top of the per-email limits below.
const limiterOptions = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false }
const sendLimiter = rateLimit({ ...limiterOptions, limit: 10, message: { detail: 'Too many requests. Please try again in a few minutes.' } })
const verifyLimiter = rateLimit({ ...limiterOptions, limit: 30, message: { detail: 'Too many attempts. Please try again in a few minutes.' } })

const tooMany = (res, detail, retryAfter) => {
  if (retryAfter) res.set('Retry-After', String(retryAfter))
  return res.status(429).json({ detail, ...(retryAfter ? { retryAfter } : {}) })
}

// POST /api/auth/send-otp  { email }
router.post(
  '/send-otp',
  sendLimiter,
  wrap(async (req, res) => {
    const email = normalizeEmail(req.body?.email)
    if (!EMAIL_RX.test(email) || email.length > 254) {
      return res.status(400).json({ detail: 'Please enter a valid email address.' })
    }
    // Case-insensitive, so "Name@Gmail.com" and "name@gmail.com" count as the same account.
    if (await User.exists({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') })) {
      return res.status(409).json({ detail: 'An account with this email already exists. Please log in instead.' })
    }
    if (!mailConfigured() && !devLogEnabled()) {
      return res.status(503).json({ detail: 'Email sending is not set up on the server yet.' })
    }

    const now = Date.now()
    const record = (await EmailOtp.findOne({ email })) || new EmailOtp({ email })

    if (now - +record.windowStart > WINDOW_MS) {
      record.sendCount = 0
      record.windowStart = new Date(now)
    }
    if (record.lastSentAt) {
      const wait = Math.ceil((RESEND_COOLDOWN_S * 1000 - (now - +record.lastSentAt)) / 1000)
      if (wait > 0) return tooMany(res, `Please wait ${wait} second${wait === 1 ? '' : 's'} before requesting another OTP.`, wait)
    }
    if (record.sendCount >= MAX_SENDS_PER_HOUR) {
      return tooMany(res, 'Too many OTP requests for this email. Please try again in an hour.', 3600)
    }

    const previousLastSentAt = record.lastSentAt
    const otp = generateOtp()
    record.otpHash = hashOtp(email, otp) // only the hash is stored
    record.otpExpiresAt = new Date(now + OTP_TTL_MS)
    record.attempts = 0
    record.lastSentAt = new Date(now)
    record.sendCount += 1
    record.verifiedJti = null // a new OTP cancels any earlier "verified" state
    await record.save()

    try {
      if (mailConfigured()) await sendOtpEmail(email, otp)
      else console.log(`[OTP_DEV_LOG] OTP for ${email}: ${otp}`)
    } catch (err) {
      console.error('Could not send OTP email:', err?.message)
      // Undo the send so a mail problem does not use up the user's attempts.
      await EmailOtp.updateOne(
        { email },
        { $set: { otpHash: null, otpExpiresAt: null, lastSentAt: previousLastSentAt }, $inc: { sendCount: -1 } }
      )
      return res.status(502).json({ detail: 'We could not send the email. Please check the address and try again.' })
    }

    res.json({
      message: 'OTP sent successfully to your email.',
      expiresIn: OTP_TTL_MS / 1000,
      resendAfter: RESEND_COOLDOWN_S,
    })
  })
)

// POST /api/auth/verify-otp  { email, otp }  ->  { verified: true, verificationToken }
router.post(
  '/verify-otp',
  verifyLimiter,
  wrap(async (req, res) => {
    const email = normalizeEmail(req.body?.email)
    const otp = String(req.body?.otp ?? '').trim()
    if (!EMAIL_RX.test(email)) return res.status(400).json({ detail: 'Please enter a valid email address.' })
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ detail: 'Please enter the 6-digit OTP.' })

    // Count this guess first, atomically. Even if someone fires many requests at once, only
    // MAX_ATTEMPTS of them are ever compared against the real OTP.
    const record = await EmailOtp.findOneAndUpdate({ email, otpHash: { $ne: null } }, { $inc: { attempts: 1 } }, { returnDocument: 'after' })
    if (!record) return res.status(400).json({ detail: 'No active OTP for this email. Please request a new one.' })

    if (!record.otpExpiresAt || +record.otpExpiresAt <= Date.now()) {
      await EmailOtp.updateOne({ email }, { $set: { otpHash: null, otpExpiresAt: null } })
      return res.status(400).json({ detail: 'This OTP has expired. Please request a new one.' })
    }
    if (record.attempts > MAX_ATTEMPTS) {
      await EmailOtp.updateOne({ email }, { $set: { otpHash: null, otpExpiresAt: null } })
      return tooMany(res, 'Too many incorrect attempts. Please request a new OTP.')
    }

    if (!otpMatches(record.otpHash, email, otp)) {
      const left = MAX_ATTEMPTS - record.attempts
      if (left <= 0) {
        await EmailOtp.updateOne({ email }, { $set: { otpHash: null, otpExpiresAt: null } })
        return tooMany(res, 'Too many incorrect attempts. Please request a new OTP.')
      }
      return res.status(400).json({ detail: `Incorrect OTP. ${left} attempt${left === 1 ? '' : 's'} left.` })
    }

    // Correct. Burn the OTP so it can never be used again; only one of two simultaneous
    // correct submissions can win this update.
    const jti = crypto.randomUUID()
    const used = await EmailOtp.findOneAndUpdate(
      { email, otpHash: record.otpHash },
      { $set: { otpHash: null, otpExpiresAt: null, attempts: 0, verifiedJti: jti, windowStart: new Date() } },
      { returnDocument: 'after' }
    )
    if (!used) return res.status(400).json({ detail: 'This OTP has already been used. Please request a new one.' })

    res.json({ verified: true, message: 'Email verified successfully.', verificationToken: signVerificationToken(email, jti) })
  })
)

export default router