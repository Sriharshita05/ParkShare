import nodemailer from 'nodemailer'

// SMTP settings come from backend/.env (read at call time, so they are always the loaded values).
export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

let transporter = null
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
  }
  return transporter
}

export async function sendOtpEmail(to, otp) {
  const from = process.env.MAIL_FROM || `ParkShare <${process.env.SMTP_USER}>`
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

  await getTransporter().sendMail({ from, to, subject: 'Your ParkShare verification code', text, html })
}