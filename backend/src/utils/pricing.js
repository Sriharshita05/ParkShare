// Pricing lives on the server so a user cannot change the amount they pay by editing the request.
// These values mirror the booking panel on the SpaceDetails page.
export const PLATFORM_FEE_RATE = 0.1
export const BOOKABLE_HOURS = [1, 2, 4, 8, 24] // 24 = "Full day"

export function priceFor(space, hours) {
  const base = hours === 24 ? space.pricePerDay : space.pricePerHour * hours
  const fee = Math.round(base * PLATFORM_FEE_RATE)
  return { base, fee, total: base + fee }
}
