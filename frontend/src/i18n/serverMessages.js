import i18n from './index'

// The API answers in English. These are the exact messages it sends, mapped to translation keys, so the
// visitor sees them in their own language. Anything not listed here is shown as the server sent it.
const EXACT = {
  'An account with this email already exists. Please log in instead.': 'server.accountExists',
  'Email sending is not set up on the server yet.': 'server.emailNotSetUp',
  'Invalid request body.': 'server.invalidBody',
  'No active OTP for this email. Please request a new one.': 'server.noActiveOtp',
  'Not found.': 'server.notFound',
  'Please choose a valid duration.': 'server.invalidDuration',
  'Please choose a vehicle type this space accepts.': 'server.invalidVehicle',
  'Please enter a valid email address.': 'server.invalidEmail',
  'Please enter the 6-digit OTP.': 'server.enterSixDigits',
  'Please verify your email with the OTP before creating your account.': 'server.verifyEmailFirst',
  'Something went wrong on our side. Please try again.': 'server.serverError',
  'Space not found.': 'server.spaceNotFound',
  'This space has active or upcoming bookings. Pause it instead of deleting it.': 'server.hasBookings',
  'This space is fully booked right now. Please try another space.': 'server.fullyBooked',
  'This space is not accepting bookings right now.': 'server.notAccepting',
  'Too many attempts. Please try again in a few minutes.': 'server.tooManyAttempts',
  'Too many requests. Please try again in a few minutes.': 'server.tooManyRequests',
  'Too many incorrect attempts. Please request a new OTP.': 'server.tooManyIncorrect',
  'Too many OTP requests for this email. Please try again in an hour.': 'server.tooManyOtpRequests',
  'We could not send the email. Please check the address and try again.': 'server.sendFailed',
  'You can only change your own spaces.': 'server.ownSpacesOnly',
  'You cannot book your own space.': 'server.ownSpaceBooking',
  'Your email verification has expired. Please verify your email again.': 'server.verificationExpired',
  'This OTP has already been used. Please request a new one.': 'server.otpUsed',
  'This OTP has expired. Please request a new one.': 'server.otpExpired',
}

const PATTERNS = [
  [/^Incorrect OTP\. (\d+) attempts? left\.$/, 'server.incorrectOtp'],
  [/^Please wait (\d+) seconds? before requesting another OTP\.$/, 'server.waitSeconds'],
]

export function localizeServerMessage(message) {
  if (typeof message !== 'string') return message
  if (EXACT[message]) return i18n.t(EXACT[message])
  for (const [rx, key] of PATTERNS) {
    const m = rx.exec(message)
    if (m) return i18n.t(key, { count: Number(m[1]) })
  }
  return message
}