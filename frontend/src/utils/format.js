export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`

export const distance = (m) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`)

export const pad = (n) => String(n).padStart(2, '0')

export const clock = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export const PLATFORM_FEE_RATE = 0.1
