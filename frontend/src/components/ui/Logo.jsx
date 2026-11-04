import { Link } from 'react-router-dom'

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ps-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3374f6" />
          <stop offset="1" stopColor="#0f1d3d" />
        </linearGradient>
      </defs>
      <path
        d="M32 3C19.8 3 10 12.6 10 24.5 10 40 32 61 32 61s22-21 22-36.5C54 12.6 44.2 3 32 3z"
        fill="url(#ps-logo)"
      />
      <path d="M25 16h10.5a8 8 0 010 16H31v10h-6V16zm6 5.5v5h4.2a2.5 2.5 0 000-5H31z" fill="#fff" fillRule="evenodd" />
    </svg>
  )
}

export default function Logo({ tagline = false, light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="ParkShare home">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-display text-xl font-extrabold ${light ? 'text-white' : 'text-navy-900'}`}>
          Park<span className={light ? 'text-brand-300' : 'text-brand-600'}>Share</span>
        </span>
        {tagline && (
          <span className={`mt-1 block text-[10px] font-medium ${light ? 'text-navy-200' : 'text-navy-500'}`}>
            Smart Parking for a Smarter Tomorrow
          </span>
        )}
      </span>
    </Link>
  )
}
