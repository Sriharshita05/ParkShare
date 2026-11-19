// Date helpers for the owner dashboard. India has no daylight saving, so a fixed +05:30 offset is exact.
const IST_MS = 5.5 * 60 * 60 * 1000
export const DAY_MS = 24 * 60 * 60 * 1000

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ist = (t) => new Date(t + IST_MS) // read the UTC getters of this to get IST wall-clock values

export const dayKey = (t) => ist(t).toISOString().slice(0, 10)
export const weekday = (t) => WEEKDAYS[ist(t).getUTCDay()]

// Midnight (IST) at the start of the day containing t, as a UTC timestamp.
export const startOfDay = (t) => Math.floor((t + IST_MS) / DAY_MS) * DAY_MS - IST_MS

// First moment of the month containing t (offsetMonths = -1 for the previous month).
export const startOfMonth = (t, offsetMonths = 0) => {
  const d = ist(t)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offsetMonths, 1) - IST_MS
}

export function clock(t) {
  const d = ist(t)
  const h = d.getUTCHours()
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`
}

export function dayLabel(t, now = Date.now()) {
  if (dayKey(t) === dayKey(now)) return 'Today'
  if (dayKey(t) === dayKey(now - DAY_MS)) return 'Yesterday'
  if (now - t < 6 * DAY_MS && t < now) return weekday(t)
  const d = ist(t)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

// "Today, 9:00 AM – 6:00 PM"
export const whenLabel = (start, end, now = Date.now()) => `${dayLabel(start, now)}, ${clock(start)} – ${clock(end)}`

// "Simran Kaur" -> "Simran K." (owners see a short driver name)
export function shortName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Driver'
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}
