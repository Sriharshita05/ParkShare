// Sends OTP emails through Brevo's HTTPS API. Render's free tier blocks SMTP ports,
// so this uses a normal HTTPS request instead of nodemailer.
// Needs BREVO_API_KEY and MAIL_FROM (a sender verified in Brevo) in backend/.env or Render's Environment page.

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email'

export const mailConfigured = () => Boolean(process.env.BREVO_API_KEY && process.env.MAIL_FROM)

// MAIL_FROM can be "you@gmail.com" or "ParkShare <you@gmail.com>".
function parseSender(value) {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value)
  if (match) return { name: match[1] || 'ParkShare', email: match[2].trim() }
  return { name: 'ParkShare', email: value.trim() }
}

export async function sendOtpEmail(to, otp) {
  const text = [
    `Your ParkShare verification code is ${otp}.`,
    '',
    'It expires in 5 minutes. Do not share this code with anyone.',
    'If you did not try to create a ParkShare account, you can ignore this email.',
  ].join('\n')

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:24px">
    <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e3e9f3">
      <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#0b1f44">ParkShare</p>
      <p style="margin:0 0 20px;font-size:14px;color:#51607a">Verify your email address</p>
      <p style="margin:0 0 8px;font-size:14px;color:#0b1f44">Your verification code is:</p>
      <p style="margin:0 0 20px;font-size:34px;font-weight:700;letter-spacing:8px;color:#1d4ed8">${otp}</p>
      <p style="margin:0 0 6px;font-size:13px;color:#51607a">This code expires in 5 minutes. Never share it with anyone.</p>
      <p style="margin:0;font-size:13px;color:#51607a">If you did not try to create a ParkShare account, you can ignore this email.</p>
    </div>
  </div>`

  const response = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: parseSender(process.env.MAIL_FROM),
      to: [{ email: to }],
      subject: 'Your ParkShare verification code',
      textContent: text,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(`Brevo ${response.status}: ${body.message || response.statusText}`)
  }
}