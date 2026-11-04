import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Car, Check, Eye, EyeOff, Globe, Home, Lock, Mail, User } from 'lucide-react'
import AuthShell from '../components/auth/AuthShell'
import FormField from '../components/auth/FormField'
import PasswordStrength from '../components/auth/PasswordStrength'
import AuthNotice from '../components/auth/AuthNotice'
import Button from '../components/ui/Button'
import { homeFor, useAuth } from '../context/AuthContext'
import { login, register, requestPasswordReset } from '../services/api'
import { validateEmail, validateName, validatePassword } from '../utils/validation'

const COPY = {
  login: { title: 'Welcome back', text: 'Log in to continue.', cta: 'Log in' },
  signup: { title: 'Create your account', text: 'Start parking smarter in a minute.', cta: 'Create account' },
  forgot: { title: 'Reset your password', text: "Enter your email and we'll send you reset instructions.", cta: 'Send reset link' },
}

const FIELDS = { login: ['email', 'password'], signup: ['name', 'email', 'password'], forgot: ['email'] }

// Staggered entrance; the global reduced-motion rule neutralises it for users who opt out.
const enter = (i) => ({ animationDelay: `${80 + i * 60}ms` })

export default function Auth() {
  const [params] = useSearchParams()
  const requested = params.get('mode')
  const mode = requested === 'signup' || requested === 'forgot' ? requested : 'login'
  const navigate = useNavigate()
  const { user: currentUser, signIn } = useAuth()

  // Already logged in: skip the form.
  useEffect(() => {
    if (currentUser) navigate(homeFor(currentUser), { replace: true })
  }, [currentUser, navigate])

  const [values, setValues] = useState({ name: '', email: '', password: '', remember: false, role: 'driver' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)

  // Reset transient state when switching between login / signup / forgot.
  useEffect(() => {
    setTouched({})
    setSubmitted(false)
    setNotice(null)
    setShowPassword(false)
    setValues((v) => ({ ...v, password: '' }))
  }, [mode])

  const errors = useMemo(
    () => ({
      name: mode === 'signup' ? validateName(values.name) : '',
      email: validateEmail(values.email),
      password: mode === 'forgot' ? '' : validatePassword(values.password, { strict: mode === 'signup' }),
    }),
    [mode, values.name, values.email, values.password]
  )
  const visibleError = (f) => (touched[f] || submitted ? errors[f] : '')

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setNotice(null)

    const firstInvalid = FIELDS[mode].find((f) => errors[f])
    if (firstInvalid) {
      setNotice({ tone: 'error', text: 'Please fix the highlighted fields and try again.' })
      document.getElementById(firstInvalid)?.focus()
      return
    }

    setLoading(true)
    const email = values.email.trim()
    try {
      if (mode === 'forgot') {
        const res = await requestPasswordReset({ email })
        setNotice({ tone: 'info', text: res?.message || 'If an account exists for that email, reset instructions will be sent.' })
        return
      }
      const result =
        mode === 'signup'
          ? await register({ name: values.name.trim(), email, password: values.password, role: values.role })
          : await login({ email, password: values.password, remember: values.remember })
      signIn(result, mode === 'login' ? values.remember : false)
      navigate(homeFor(result.user), { replace: true })
    } catch (err) {
      setNotice({ tone: 'error', text: err.message || 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const copy = COPY[mode]

  return (
    <AuthShell>
      <div key={mode}>
        <div className="animate-fade-up" style={enter(0)}>
          <h1 className="text-3xl font-extrabold text-navy-900">{copy.title}</h1>
          <p className="mt-1.5 text-[15px] text-navy-500">{copy.text}</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-7">
          <fieldset disabled={loading} className="contents">
            <div className="space-y-5">
              {mode === 'signup' && (
                <fieldset className="animate-fade-up" style={enter(1)}>
                  <legend className="mb-1.5 text-sm font-semibold text-navy-800">I want to</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['driver', 'Find parking', Car],
                      ['owner', 'List my space', Home],
                    ].map(([id, label, Icon]) => (
                      <label key={id} className="cursor-pointer">
                        <input type="radio" name="role" value={id} checked={values.role === id} onChange={set('role')} className="peer sr-only" />
                        <span className="flex items-center justify-center gap-2 rounded-xl border border-navy-200 bg-white px-3 py-3 text-sm font-semibold text-navy-600 transition hover:border-brand-300 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-checked:ring-2 peer-checked:ring-brand-200 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500">
                          <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {mode === 'signup' && (
                <FormField
                  id="name"
                  label="Full name"
                  icon={User}
                  value={values.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  error={visibleError('name')}
                  autoComplete="name"
                  placeholder="Your full name"
                  className="animate-fade-up"
                  style={enter(2)}
                />
              )}

              <FormField
                id="email"
                label="Email"
                icon={Mail}
                type="email"
                inputMode="email"
                value={values.email}
                onChange={set('email')}
                onBlur={blur('email')}
                error={visibleError('email')}
                autoComplete="email"
                placeholder="name@example.com"
                className="animate-fade-up"
                style={enter(2)}
              />

              {mode !== 'forgot' && (
                <div className="animate-fade-up" style={enter(3)}>
                  <FormField
                    id="password"
                    label="Password"
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
                    error={visibleError('password')}
                    hint={mode === 'signup' ? 'At least 8 characters. Mix letters, numbers and symbols for a stronger password.' : undefined}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                    labelAside={
                      mode === 'login' && (
                        <Link to="/auth?mode=forgot" className="text-xs font-semibold text-brand-700 transition hover:text-brand-600 hover:underline">
                          Forgot password?
                        </Link>
                      )
                    }
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="rounded-lg p-2 text-navy-400 transition hover:bg-navy-50 hover:text-navy-700"
                      >
                        {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    }
                  />
                  {mode === 'signup' && <PasswordStrength value={values.password} />}
                </div>
              )}

              {mode === 'login' && (
                <label className="animate-fade-up flex w-fit cursor-pointer items-center gap-2.5 text-sm text-navy-700" style={enter(4)}>
                  <input type="checkbox" checked={values.remember} onChange={set('remember')} className="peer sr-only" />
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-navy-300 bg-white transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                    <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </span>
                  Remember me
                </label>
              )}
            </div>

            {notice && (
              <div className="mt-5">
                <AuthNotice tone={notice.tone} title={notice.title}>
                  {notice.text}
                </AuthNotice>
              </div>
            )}

            <div className="animate-fade-up" style={enter(5)}>
              <Button type="submit" size="lg" className="mt-6 w-full !py-3.5 text-[15px]" loading={loading} iconRight={ArrowRight}>
                {loading ? 'Please wait…' : copy.cta}
              </Button>
            </div>
          </fieldset>
        </form>

        {mode !== 'forgot' && (
          <div className="animate-fade-up" style={enter(6)}>
            <div className="my-6 flex items-center gap-4" role="separator" aria-label="or">
              <span className="h-px flex-1 bg-navy-100" />
              <span className="text-xs font-medium uppercase tracking-wider text-navy-400">or continue with</span>
              <span className="h-px flex-1 bg-navy-100" />
            </div>
            <button
              type="button"
              onClick={() =>
                setNotice({
                  tone: 'info',
                  title: 'Google sign-in is not connected yet',
                  text: 'It will be enabled together with the authentication API.',
                })
              }
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-semibold text-navy-800 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
            >
              <Globe className="h-[18px] w-[18px] text-brand-600" aria-hidden="true" />
              Continue with Google
            </button>
          </div>
        )}

        <p className="animate-fade-up mt-7 text-center text-sm text-navy-500" style={enter(7)}>
          {mode === 'login' && (
            <>
              New to ParkShare?{' '}
              <Link to="/auth?mode=signup" className="font-semibold text-brand-700 hover:underline">
                Create an account
              </Link>
            </>
          )}
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <Link to="/auth" className="font-semibold text-brand-700 hover:underline">
                Log in
              </Link>
            </>
          )}
          {mode === 'forgot' && (
            <Link to="/auth" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to log in
            </Link>
          )}
        </p>
      </div>
    </AuthShell>
  )
}
