// Service layer. Every function is async and returns the same shape the API returns.
// Parking spaces, bookings and the owner dashboard now come from the real backend.
// To go back to the sample data for a quick UI experiment, set USE_MOCK = true.
// Auth tokens are attached centrally in `request`.

import { spaces, ownerStats, earningsSeries, ownerListings, ownerBookings, reviews } from '../data/mockData'
import { getToken } from '../utils/session'

const USE_MOCK = false
// Must include the /api part, e.g. VITE_API_URL=https://parkshare-backend.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms))

async function request(path, options = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    })
  } catch {
    throw new NetworkError()
  }
  if (!res.ok) {
    // The API returns { detail: "..." } for errors.
    const body = await res.json().catch(() => null)
    throw new ApiError(typeof body?.detail === 'string' ? body.detail : `Request failed (${res.status}).`, res.status)
  }
  return res.json()
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Thrown when the server cannot be reached at all (not running, wrong URL, CORS, offline).
export class NetworkError extends Error {
  constructor() {
    super('Cannot reach the ParkShare server. Make sure the backend is running and try again.')
    this.name = 'NetworkError'
  }
}

// { q: 'sector', maxPrice: '', vehicle: 'Car' } -> "?q=sector&vehicle=Car" (empty values are skipped)
function toQuery(params) {
  const qs = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    qs.set(key, Array.isArray(value) ? value.join(',') : String(value))
  })
  const text = qs.toString()
  return text ? `?${text}` : ''
}

const json = (method, payload) => ({ method, body: JSON.stringify(payload) })

// ---- Parking spaces ----------------------------------------------------------------------------
// GET /spaces?q=&vehicle=&type=&maxPrice=&amenity=   (public)
export async function searchSpaces(params = {}) {
  if (!USE_MOCK) return request(`/spaces${toQuery(params)}`)
  await wait()
  return spaces
}

// Returns null when the space does not exist (or cannot be loaded), so the page shows "Space not found".
export async function getSpace(id) {
  if (!USE_MOCK) {
    try {
      return await request(`/spaces/${encodeURIComponent(id)}`)
    } catch (err) {
      console.error('getSpace failed:', err)
      return null
    }
  }
  await wait(250)
  return spaces.find((s) => s.id === id) || null
}

export async function getReviews(spaceId) {
  if (!USE_MOCK) {
    try {
      return await request(`/spaces/${encodeURIComponent(spaceId)}/reviews`)
    } catch {
      return []
    }
  }
  await wait(200)
  return reviews
}

// ---- Bookings (login required) -----------------------------------------------------------------
// POST /bookings { spaceId, hours, vehicle } -> { id, status, spaceId, hours, vehicle, total, startTime, endTime }
// The server works out the price; the "total" sent by the page is ignored.
export async function createBooking(payload) {
  if (!USE_MOCK) return request('/bookings', json('POST', payload))
  await wait(900)
  return { id: `BK-${Math.floor(2100 + Math.random() * 800)}`, status: 'confirmed', ...payload }
}

export const getMyBookings = () => request('/bookings/mine')

// ---- Owner (owner account required) ------------------------------------------------------------
export async function getOwnerDashboard() {
  if (!USE_MOCK) return request('/owner/dashboard')
  await wait()
  return { stats: ownerStats, series: earningsSeries, listings: ownerListings, bookings: ownerBookings }
}

export const getMySpaces = () => request('/spaces/mine')
export const createSpace = (payload) => request('/spaces', json('POST', payload))
export const updateSpace = (id, payload) => request(`/spaces/${encodeURIComponent(id)}`, json('PATCH', payload)) // e.g. { status: 'paused' }
export const deleteSpace = (id) => request(`/spaces/${encodeURIComponent(id)}`, { method: 'DELETE' })

// ---- Authentication ----------------------------------------------------------------------------
//   POST /auth/send-otp        { email }                       -> { message, expiresIn, resendAfter }   signup step 1
//   POST /auth/verify-otp      { email, otp }                  -> { verified, verificationToken }       signup step 2
//   POST /auth/register        { name, email, password, role, verificationToken } -> { token, user }   role: 'driver' | 'owner'
//   POST /auth/login           { email, password, remember }   -> { token, user: { id, name, email, role } }
//   POST /auth/forgot-password { email }                       -> { message }
//   GET  /auth/me                                              -> { user }
const post = (path, payload) => request(path, json('POST', payload))

export const sendSignupOtp = (payload) => post('/auth/send-otp', payload)
export const verifySignupOtp = (payload) => post('/auth/verify-otp', payload)
export const login = (payload) => post('/auth/login', payload)
export const register = (payload) => post('/auth/register', payload)
export const requestPasswordReset = (payload) => post('/auth/forgot-password', payload)
export const getCurrentUser = () => request('/auth/me')