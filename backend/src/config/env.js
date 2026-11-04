import 'dotenv/config'

const required = ['MONGODB_URI', 'JWT_SECRET']
const missing = required.filter((k) => process.env[k] === undefined || process.env[k] === '')
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}\nCopy .env.example to .env and fill it in.`)
  process.exit(1)
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters. Generate one with:\n  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"')
  process.exit(1)
}

export const env = {
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '1d',
  jwtExpiresRemember: process.env.JWT_EXPIRES_REMEMBER || '30d',
  admin: {
    name: process.env.ADMIN_NAME || 'ParkShare Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
}
