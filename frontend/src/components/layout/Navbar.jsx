import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import LanguageSwitcher from './LanguageSwitcher'
import { useAuth } from '../../context/AuthContext'

function UserChip({ user, onLogout }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2.5 rounded-xl border border-navy-100 bg-white py-1.5 pl-1.5 pr-3 shadow-soft">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-navy-800 text-sm font-bold text-white">
          {user.name[0].toUpperCase()}
        </span>
        <span className="leading-tight">
          <span className="block max-w-[140px] truncate text-sm font-semibold text-navy-900">{user.name}</span>
          <span className="block text-[11px] font-medium text-navy-500">{t(`roles.${user.role}`)}</span>
        </span>
      </div>
      <Button variant="ghost" size="sm" icon={LogOut} onClick={onLogout}>
        {t('nav.logOut')}
      </Button>
    </div>
  )
}

// Links depend on who is logged in, so nobody is sent to a page their role cannot open.
function linksFor(user) { // each `label` is a translation key
  if (!user) {
    return [
      { to: '/find', label: 'nav.findParking' },
      { to: '/auth?mode=signup', label: 'nav.listYourSpace' },
    ]
  }
  if (user.role === 'admin') {
    return [
      { to: '/find', label: 'nav.findParking' },
      { to: '/owner', label: 'nav.dashboard' },
    ]
  }
  if (user.role === 'owner') {
    return [
      { to: '/find', label: 'nav.findParking' },
      { to: '/owner', label: 'nav.myDashboard' },
      { to: '/bookings', label: 'nav.myBookings' },
    ]
  }
  return [
    { to: '/find', label: 'nav.findParking' },
    { to: '/bookings', label: 'nav.myBookings' },
  ]
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const links = linksFor(user)
  const logout = () => {
    signOut()
    navigate('/auth')
  }

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-navy-100 bg-white/85 shadow-soft backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t('nav.mainMenu')}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                }`
              }
            >
              {t(l.label)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <UserChip user={user} onLogout={logout} />
          ) : (
            <>
              <Button to="/auth" variant="ghost" size="sm">
                {t('nav.logIn')}
              </Button>
              <Button to="/auth?mode=signup" size="sm">
                {t('nav.getStarted')}
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageSwitcher />
          <button
            className="rounded-lg p-2 text-navy-800 hover:bg-navy-50"
            onClick={() => setOpen((o) => !o)}
            aria-label={t('nav.toggleMenu')}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="container-page animate-fade-up pb-5 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label={t('nav.mobileMenu')}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-navy-700'}`
                }
              >
                {t(l.label)}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface p-3">
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold text-navy-900">{user.name}</span>
                <span className="block text-xs text-navy-500">{t(`roles.${user.role}`)}</span>
              </span>
              <Button variant="secondary" size="sm" icon={LogOut} onClick={logout}>
                {t('nav.logOut')}
              </Button>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button to="/auth" variant="secondary">
                {t('nav.logIn')}
              </Button>
              <Button to="/auth?mode=signup">{t('nav.getStarted')}</Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}