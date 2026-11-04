// Service layer. Every function is async and returns the same shape a real API will.
// To connect the backend later, set USE_MOCK = false and point BASE_URL at the API.
// Auth tokens are attached centrally in `request`.

import { spaces, ownerStats, earningsSeries, ownerListings, ownerBookings, reviews } from '../data/mockData'
import { getToken } from '../utils/session'

// Sample data for parking spaces/bookings until those endpoints exist. Authentication is always live.
const USE_MOCK = true
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

export async function searchSpaces(params = {}) {
  if (!USE_MOCK) return request(`/spaces?${new URLSearchParams(params)}`)
  await wait()
  return spaces
}

export async function getSpace(id) {
  if (!USE_MOCK) return request(`/spaces/${id}`)
  await wait(250)
  return spaces.find((s) => s.id === id) || null
}

export async function getReviews(spaceId) {
  if (!USE_MOCK) return request(`/spaces/${spaceId}/reviews`)
  await wait(200)
  return reviews
}

export async function createBooking(payload) {
  if (!USE_MOCK) return request('/bookings', { method: 'POST', body: JSON.stringify(payload) })
  await wait(900)
  return { id: `BK-${Math.floor(2100 + Math.random() * 800)}`, status: 'confirmed', ...payload }
}

export async function getOwnerDashboard() {
  if (!USE_MOCK) return request('/owner/dashboard')
  await wait()
  return { stats: ownerStats, series: earningsSeries, listings: ownerListings, bookings: ownerBookings }
}

// ---- Authentication (live; talks to the Express + MySQL backend) -----------
//   POST /auth/login           { email, password, remember }   -> { token, user: { id, name, email, role } }
//   POST /auth/register        { name, email, password, role } -> { token, user }   role: 'driver' | 'owner'
//   POST /auth/forgot-password { email }                       -> { message }
//   GET  /auth/me                                              -> { user }
const post = (path, payload) => request(path, { method: 'POST', body: JSON.stringify(payload) })

export const login = (payload) => post('/auth/login', payload)
export const register = (payload) => post('/auth/register', payload)
export const requestPasswordReset = (payload) => post('/auth/forgot-password', payload)
export const getCurrentUser = () => request('/auth/me')
