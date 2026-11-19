import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const OTP_TTL_MS = 5 * 60 * 1000 // an OTP is valid for 5 minutes
export const RESEND_COOLDOWN_S = 45 // wait this long before asking for another OTP
export const MAX_SENDS_PER_HOUR = 5 // OTP emails per address per hour
export const MAX_ATTEMPTS = 5 // wrong guesses allowed per OTP
export const WINDOW_MS = 60 * 60 * 1000

export const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

// Cryptographically secure 6-digit code, including leading zeros ("004217").
export const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')

// Keyed hash (HMAC). A plain hash of a 6-digit number could be reversed in milliseconds if the
// database ever leaked; keying it with the server secret prevents that.
export const hashOtp = (email, otp) =>
  crypto.createHmac('sha256', `${env.jwtSecret}:otp`).update(`${email}:${otp}`).digest('hex')

export function otpMatches(storedHash, email, otp) {
  const a = Buffer.from(String(storedHash), 'hex')
  const b = Buffer.from(hashOtp(email, otp), 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// "Email verified" proof handed to the browser after a correct OTP and checked again at registration.
// It uses a different signing key from login tokens, so one can never be used as the other.
const verifyKey = () => `${env.jwtSecret}:email-verify`

export const signVerificationToken = (email, jti) =>
  jwt.sign({ purpose: 'signup-email', email, jti }, verifyKey(), { expiresIn: '15m' })

export function readVerificationToken(token) {
  if (typeof token !== 'string' || !token) return null
  try {
    const claims = jwt.verify(token, verifyKey())
    return claims.purpose === 'signup-email' ? claims : null
  } catch {
    return null
  }
}