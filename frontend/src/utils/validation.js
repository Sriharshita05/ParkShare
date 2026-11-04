const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const validateName = (v) => {
  const s = v.trim()
  if (!s) return 'Enter your full name.'
  if (s.length < 2) return 'Name must be at least 2 characters.'
  return ''
}

export const validateEmail = (v) => {
  const s = v.trim()
  if (!s) return 'Enter your email address.'
  if (!EMAIL_RE.test(s)) return 'Enter a valid email address, like name@example.com.'
  return ''
}

// On login only presence is checked; the server decides whether the password is right.
// On signup we also enforce a minimum length.
export const validatePassword = (v, { strict = false } = {}) => {
  if (!v) return strict ? 'Create a password.' : 'Enter your password.'
  if (strict && v.length < 8) return 'Use at least 8 characters.'
  return ''
}

export const passwordStrength = (v) => {
  if (!v) return { score: 0, label: '' }
  const score = [v.length >= 8, /[a-z]/.test(v) && /[A-Z]/.test(v), /\d/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length
  return { score, label: ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score] }
}
