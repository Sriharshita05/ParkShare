// Express 4 does not catch errors thrown inside async route handlers, so a failed database call
// would crash the server. Wrap every async handler with this so errors reach the error middleware
// in server.js instead. (It is harmless on Express 5, which does this natively.)
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export const isObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
