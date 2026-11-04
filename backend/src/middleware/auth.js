import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const signToken = (user, remember = false) =>
  jwt.sign({ sub: String(user.id), role: user.role }, env.jwtSecret, {
    expiresIn: remember ? env.jwtExpiresRemember : env.jwtExpires,
  })

// Requires "Authorization: Bearer <token>". Sets req.auth = { id, role }.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ detail: 'Please log in to continue.' })
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.auth = { id: payload.sub, role: payload.role }
    next()
  } catch {
    res.status(401).json({ detail: 'Your session has expired. Please log in again.' })
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.auth?.role) ? next() : res.status(403).json({ detail: 'You do not have access to this.' })
