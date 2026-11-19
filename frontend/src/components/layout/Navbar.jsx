import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

const roleLabel = { admin: 'Admin', owner: 'Space owner', driver: 'Driver' }

function UserChip({ user, onLogout }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2.5 rounded-xl border border-navy-100 bg-white py-1.5 pl-1.5 pr-3 shadow-soft">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-navy-800 text-sm font-bold text-white">
          {user.name[0].toUpperCase()}
        </span>
        <span className="leading-tight">
          <span className="block max-w-[140px] truncate text-sm font-semibold text-navy-900">{user.name}</span>
          <span className="block text-[11px] font-medium text-navy-500">{roleLabel[user.role]}</span>
        </span>
      </div>
      <Button variant="ghost" size="sm" icon={LogOut} onClick={onLogout}>
        Log out
      </Button>
    </div>
  )
}

// Links depend on who is logged in, so nobody is sent to a page their role cannot open.
function linksFor(user) {
  if (!user) {
    return [
      { to: '/find', label: 'Find Parking' },
      { to: '/auth?mode=signup', label: 'List Your Space' },
    ]
  }
  if (user.role === 'admin') {
    return [
      { to: '/find', label: 'Find Parking' },
      { to: '/owner', label: 'Dashboard' },
    ]
  }
  if (user.role === 'owner') {
    return [
      { to: '/find', label: 'Find Parking' },
      { to: '/owner', label: 'My Dashboard' },
      { to: '/bookings', label: 'My Bookings' },
    ]
  }
  return [
    { to: '/find', label: 'Find Parking' },
    { to: '/bookings', label: 'My Bookings' },
  ]
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()
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
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <UserChip user={user} onLogout={logout} />
          ) : (
            <>
              <Button to="/auth" variant="ghost" size="sm">
                Log in
              </Button>
              <Button to="/auth?mode=signup" size="sm">
                Get started
              </Button>
            </>
          )}
        </div>
        <button
          className="rounded-lg p-2 text-navy-800 hover:bg-navy-50 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="container-page animate-fade-up pb-5 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-navy-700'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface p-3">
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold text-navy-900">{user.name}</span>
                <span className="block text-xs text-navy-500">{roleLabel[user.role]}</span>
              </span>
              <Button variant="secondary" size="sm" icon={LogOut} onClick={logout}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button to="/auth" variant="secondary">
                Log in
              </Button>
              <Button to="/auth?mode=signup">Get started</Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}