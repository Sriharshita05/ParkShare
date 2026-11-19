import EmailOtp from '../models/EmailOtp.js'
import { normalizeEmail, readVerificationToken } from '../utils/otp.js'

// Runs in front of the existing POST /api/auth/register handler (see server.js).
// The account is only created if the request carries a valid, unused "email verified" token
// for exactly the email being registered. The token is consumed once registration succeeds.
export async function requireVerifiedEmail(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email)
    const claims = readVerificationToken(req.body?.verificationToken)
    if (!claims || claims.email !== email) {
      return res.status(403).json({ detail: 'Please verify your email with the OTP before creating your account.' })
    }

    const record = await EmailOtp.findOne({ email, verifiedJti: claims.jti })
    if (!record) {
      return res.status(403).json({ detail: 'Your email verification has expired. Please verify your email again.' })
    }

    // Single use: once the account has been created, delete the record so the token cannot be replayed.
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) EmailOtp.deleteOne({ _id: record._id }).catch(() => {})
    })
    next()
  } catch (err) {
    next(err)
  }
}