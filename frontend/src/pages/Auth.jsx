import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { ArrowRight, ArrowLeft, Car, Check, CheckCircle2, Eye, EyeOff, Globe, Home, Loader2, Lock, Mail, Send, User } from 'lucide-react'
import AuthShell from '../components/auth/AuthShell'
import FormField from '../components/auth/FormField'
import PasswordStrength from '../components/auth/PasswordStrength'
import AuthNotice from '../components/auth/AuthNotice'
import OtpInput from '../components/auth/OtpInput'
import Button from '../components/ui/Button'
import { homeFor, useAuth } from '../context/AuthContext'
import { login, register, requestPasswordReset, sendSignupOtp, verifySignupOtp } from '../services/api'
import { validateEmail, validateName, validatePassword } from '../utils/validation'

const FIELDS = { login: ['email', 'password'], signup: ['name', 'email', 'password'], forgot: ['email'] }

// Staggered entrance; the global reduced-motion rule neutralises it for users who opt out.
const enter = (i) => ({ animationDelay: `${80 + i * 60}ms` })

const formatCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Auth() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const requested = params.get('mode')
  const mode = requested === 'signup' || requested === 'forgot' ? requested : 'login'
  const navigate = useNavigate()
  const location = useLocation()
  // Page the visitor wanted before being sent to login (set by ProtectedRoute / the Book button).
  // Internal paths only.
  const from = typeof location.state?.from === 'string' && location.state.from.startsWith('/') ? location.state.from : null
  const { user: currentUser, signIn } = useAuth()

  // Already logged in: skip the form.
  useEffect(() => {
    if (currentUser) navigate(from || homeFor(currentUser), { replace: true })
  }, [currentUser, navigate, from])

  const [values, setValues] = useState({ name: '', email: '', password: '', remember: false, role: 'driver' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null)

  // Email verification (signup only): idle -> sent -> verified
  const [otp, setOtp] = useState('')
  const [otpStage, setOtpStage] = useState('idle')
  const [otpBusy, setOtpBusy] = useState('') // '' | 'send' | 'verify'
  const [otpMsg, setOtpMsg] = useState(null) // { tone: 'success' | 'error', text }
  const [cooldown, setCooldown] = useState(0)
  const [verificationToken, setVerificationToken] = useState('')
  const otpRun = useRef(0) // bumped on every reset so late responses for an old email are ignored

  const resetOtp = useCallback(() => {
    otpRun.current += 1
    setOtp('')
    setOtpStage('idle')
    setOtpBusy('')
    setOtpMsg(null)
    setCooldown(0)
    setVerificationToken('')
  }, [])

  // Resend countdown.
  useEffect(() => {
    if (cooldown <= 0) return undefined
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Reset transient state when switching between login / signup / forgot.
  useEffect(() => {
    resetOtp()
    setTouched({})
    setSubmitted(false)
    setNotice(null)
    setShowPassword(false)
    setValues((v) => ({ ...v, password: '' }))
  }, [mode, resetOtp])

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

  // Changing the email after requesting an OTP invalidates that OTP.
  const onEmailChange = (e) => {
    if (mode === 'signup') resetOtp() // also drops an in-flight request and any old error
    set('email')(e)
  }

  const sendOtp = async () => {
    setTouched((t) => ({ ...t, email: true }))
    if (errors.email) {
      document.getElementById('email')?.focus()
      return
    }
    const run = otpRun.current
    setOtpBusy('send')
    setOtpMsg(null)
    try {
      const res = await sendSignupOtp({ email: values.email.trim() })
      if (run !== otpRun.current) return
      setOtp('')
      setOtpStage('sent')
      setCooldown(Number(res?.resendAfter) || 45)
      setOtpMsg({ tone: 'success', text: t('otp.sent') })
    } catch (err) {
      if (run !== otpRun.current) return
      // "Please wait 23 seconds..." -> keep the visible timer in step with the server.
      const wait = Number(/wait (\d+) second/i.exec(err.raw || '')?.[1]) // err.raw = the server's original English text
      if (wait) setCooldown(wait)
      setOtpMsg({ tone: 'error', text: err.message || t('otp.sendFail') })
    } finally {
      if (run === otpRun.current) setOtpBusy('')
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 6 || otpBusy) return
    const run = otpRun.current
    setOtpBusy('verify')
    setOtpMsg(null)
    try {
      const res = await verifySignupOtp({ email: values.email.trim(), otp })
      if (run !== otpRun.current) return
      setVerificationToken(res.verificationToken)
      setOtpStage('verified')
      setCooldown(0)
      setNotice(null)
    } catch (err) {
      if (run !== otpRun.current) return
      setOtpMsg({ tone: 'error', text: err.message || t('otp.verifyFail') })
      setOtp('')
      document.getElementById('otp-0')?.focus()
    } finally {
      if (run === otpRun.current) setOtpBusy('')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setNotice(null)

    const firstInvalid = FIELDS[mode].find((f) => errors[f])
    if (firstInvalid) {
      setNotice({ tone: 'error', text: t('auth.fixFields') })
      document.getElementById(firstInvalid)?.focus()
      return
    }
    if (mode === 'signup' && (otpStage !== 'verified' || !verificationToken)) {
      setNotice({ tone: 'error', text: t('auth.verifyFirst') })
      return
    }

    setLoading(true)
    const email = values.email.trim()
    try {
      if (mode === 'forgot') {
        const res = await requestPasswordReset({ email })
        setNotice({ tone: 'info', text: t('auth.resetSent') })
        return
      }
      const result =
        mode === 'signup'
          ? await register({ name: values.name.trim(), email, password: values.password, role: values.role, verificationToken })
          : await login({ email, password: values.password, remember: values.remember })
      signIn(result, mode === 'login' ? values.remember : false)
      navigate(from || homeFor(result.user), { replace: true })
    } catch (err) {
      // 403 on signup: the server no longer accepts the email verification (expired or already used).
      if (mode === 'signup' && err.status === 403) {
        resetOtp()
        setNotice({ tone: 'error', text: err.message || t('otp.verifyFail') })
      } else {
        setNotice({ tone: 'error', text: err.message || t('common.somethingWrong') })
      }
    } finally {
      setLoading(false)
    }
  }

  const copy = { title: t(`auth.${mode}.title`), text: t(`auth.${mode}.text`), cta: t(`auth.${mode}.cta`) }

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
                  <legend className="mb-1.5 text-sm font-semibold text-navy-800">{t('auth.iWantTo')}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['driver', t('auth.roleFind'), Car],
                      ['owner', t('auth.roleList'), Home],
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
                  label={t('auth.fullName')}
                  icon={User}
                  value={values.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  error={visibleError('name')}
                  autoComplete="name"
                  placeholder={t('auth.fullNamePlaceholder')}
                  className="animate-fade-up"
                  style={enter(2)}
                />
              )}

              <div className="animate-fade-up" style={enter(2)}>
                <FormField
                  id="email"
                  label={t('auth.email')}
                  icon={Mail}
                  type="email"
                  inputMode="email"
                  value={values.email}
                  onChange={onEmailChange}
                  onBlur={blur('email')}
                  error={visibleError('email')}
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  readOnly={mode === 'signup' && otpStage === 'verified'}
                />

                {mode === 'signup' && otpStage === 'idle' && (
                  <div className="mt-2.5">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <p className="text-xs leading-relaxed text-navy-500">{t('otp.hint')}</p>
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={otpBusy === 'send'}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {otpBusy === 'send' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                        {otpBusy === 'send' ? t('otp.sending') : t('otp.send')}
                      </button>
                    </div>
                    {otpMsg && (
                      <p role="alert" className="mt-2 text-sm font-medium text-red-600">
                        {otpMsg.text}
                      </p>
                    )}
                  </div>
                )}

                {mode === 'signup' && otpStage === 'sent' && (
                  <div className="mt-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 shadow-soft sm:p-5">
                    {otpMsg?.tone === 'success' && (
                      <p role="status" className="mb-3 flex items-start gap-2 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {otpMsg.text}
                      </p>
                    )}
                    <p className="mb-3 text-sm text-navy-600">
                      <Trans i18nKey="otp.enterCode" values={{ email: values.email.trim() }} components={{ b: <span className="break-all font-semibold text-navy-800" /> }} />
                    </p>
                    <OtpInput value={otp} onChange={setOtp} onEnter={verifyOtp} disabled={otpBusy === 'verify'} invalid={otpMsg?.tone === 'error'} autoFocus />
                    {otpMsg?.tone === 'error' && (
                      <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                        {otpMsg.text}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otp.length !== 6 || otpBusy !== ''}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {otpBusy === 'verify' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                      {otpBusy === 'verify' ? t('otp.verifying') : t('otp.verify')}
                    </button>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={cooldown > 0 || otpBusy !== ''}
                        className="inline-flex items-center gap-1.5 font-semibold text-brand-700 transition hover:underline disabled:cursor-not-allowed disabled:text-navy-400 disabled:no-underline"
                      >
                        {otpBusy === 'send' && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                        {otpBusy === 'send' ? t('otp.sending') : cooldown > 0 ? t('otp.resendIn', { time: formatCountdown(cooldown) }) : t('otp.resend')}
                      </button>
                      <button type="button" onClick={resetOtp} className="font-semibold text-navy-500 transition hover:text-navy-800 hover:underline">
                        {t('otp.changeEmail')}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && otpStage === 'verified' && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                    <p role="status" className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {t('otp.verified')}
                    </p>
                    <button type="button" onClick={resetOtp} className="text-xs font-semibold text-emerald-800 hover:underline">
                      {t('otp.change')}
                    </button>
                  </div>
                )}
              </div>

              {mode !== 'forgot' && (
                <div className="animate-fade-up" style={enter(3)}>
                  <FormField
                    id="password"
                    label={t('auth.password')}
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
                    error={visibleError('password')}
                    hint={mode === 'signup' ? t('auth.passwordHint') : undefined}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signup' ? t('auth.passwordPlaceholderNew') : t('auth.passwordPlaceholderLogin')}
                    labelAside={
                      mode === 'login' && (
                        <Link
                          to="/auth?mode=forgot"
                          state={location.state}
                          className="text-xs font-semibold text-brand-700 transition hover:text-brand-600 hover:underline"
                        >
                          {t('auth.forgotLink')}
                        </Link>
                      )
                    }
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                  {t('auth.rememberMe')}
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
              <Button
                type="submit"
                size="lg"
                className="mt-6 w-full !py-3.5 text-[15px]"
                loading={loading}
                disabled={mode === 'signup' && otpStage !== 'verified'}
                iconRight={ArrowRight}
              >
                {loading ? t('common.pleaseWait') : copy.cta}
              </Button>
              {mode === 'signup' && otpStage !== 'verified' && <p className="mt-2 text-center text-xs text-navy-500">{t('auth.verifyToCreate')}</p>}
            </div>
          </fieldset>
        </form>

        {mode !== 'forgot' && (
          <div className="animate-fade-up" style={enter(6)}>
            <div className="my-6 flex items-center gap-4" role="separator" aria-label={t('auth.orContinueWith')}>
              <span className="h-px flex-1 bg-navy-100" />
              <span className="text-xs font-medium uppercase tracking-wider text-navy-400">{t('auth.orContinueWith')}</span>
              <span className="h-px flex-1 bg-navy-100" />
            </div>
            <button
              type="button"
              onClick={() =>
                setNotice({
                  tone: 'info',
                  title: t('auth.googleTitle'),
                  text: t('auth.googleText'),
                })
              }
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-semibold text-navy-800 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
            >
              <Globe className="h-[18px] w-[18px] text-brand-600" aria-hidden="true" />
              {t('auth.google')}
            </button>
          </div>
        )}

        <p className="animate-fade-up mt-7 text-center text-sm text-navy-500" style={enter(7)}>
          {mode === 'login' && (
            <>
              {t('auth.newHere')}{' '}
              <Link to="/auth?mode=signup" state={location.state} className="font-semibold text-brand-700 hover:underline">
                {t('auth.createLink')}
              </Link>
            </>
          )}
          {mode === 'signup' && (
            <>
              {t('auth.haveAccount')}{' '}
              <Link to="/auth" state={location.state} className="font-semibold text-brand-700 hover:underline">
                {t('auth.loginLink')}
              </Link>
            </>
          )}
          {mode === 'forgot' && (
            <Link to="/auth" state={location.state} className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('auth.backToLogin')}
            </Link>
          )}
        </p>
      </div>
    </AuthShell>
  )
}