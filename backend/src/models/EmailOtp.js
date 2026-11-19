import mongoose from 'mongoose'

// One record per email address that is going through signup verification.
// The OTP itself is never stored, only a keyed hash of it.
const emailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  otpHash: { type: String, default: null }, // null = no active OTP (never sent, used, locked or expired)
  otpExpiresAt: { type: Date, default: null },
  attempts: { type: Number, default: 0 }, // guesses made against the current OTP
  lastSentAt: { type: Date, default: null }, // for the resend cooldown
  sendCount: { type: Number, default: 0 }, // OTPs sent in the current one-hour window
  verifiedJti: { type: String, default: null }, // id of the "email verified" token issued after a correct OTP
  // The whole record is deleted automatically one hour after this moment (TTL index).
  windowStart: { type: Date, default: Date.now, index: { expireAfterSeconds: 3600 } },
})

export default mongoose.model('EmailOtp', emailOtpSchema)