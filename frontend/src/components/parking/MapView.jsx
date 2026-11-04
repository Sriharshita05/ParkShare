import { MapPin, Navigation, Plus, Minus, Crosshair } from 'lucide-react'
import { rupees } from '../../utils/format'

// Stylised placeholder map. The props contract (spaces, selectedId, onSelect)
// is what a Google Maps / Mapbox wrapper will implement later, so this component
// can be swapped out without touching the pages that use it.
export default function MapView({ spaces, selectedId, onSelect, destination = 'ABC Company', className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-navy-100 bg-[#eaf2fc] shadow-soft ${className}`}
      role="application"
      aria-label="Map of nearby parking spaces"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect width="100" height="100" fill="#eaf2fc" />
        {/* parks */}
        <rect x="4" y="52" width="18" height="14" rx="2" fill="#d3efe1" />
        <rect x="64" y="6" width="22" height="12" rx="2" fill="#d3efe1" />
        {/* water */}
        <path d="M0 88 C20 80 40 96 62 88 S90 84 100 90 L100 100 L0 100Z" fill="#cfe2fb" />
        {/* blocks */}
        {[
          [8, 8, 14, 12], [28, 6, 16, 16], [50, 30, 12, 14], [70, 34, 14, 12], [10, 28, 14, 14],
          [30, 48, 14, 12], [52, 52, 16, 12], [76, 54, 16, 14], [34, 70, 12, 10], [60, 72, 14, 8],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="1.2" fill="#dde8f6" />
        ))}
        {/* roads */}
        <g stroke="#ffffff" strokeLinecap="round" fill="none">
          <path d="M-2 24 L102 22" strokeWidth="2.6" />
          <path d="M-2 46 L102 50" strokeWidth="2.6" />
          <path d="M-2 68 L102 66" strokeWidth="2" />
          <path d="M26 -2 L24 102" strokeWidth="2.6" />
          <path d="M48 -2 L50 102" strokeWidth="2.6" />
          <path d="M72 -2 L74 102" strokeWidth="2" />
          <path d="M0 100 L100 6" strokeWidth="1.2" opacity=".8" />
        </g>
      </svg>

      {/* destination */}
      <div className="absolute left-[44%] top-[44%] z-10 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 -m-3 animate-pulse-ring rounded-full bg-brand-500/40" />
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-navy-900 text-white shadow-card">
          <Navigation className="h-4 w-4" />
        </div>
        <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-900 px-2 py-0.5 text-[10px] font-semibold text-white">
          {destination}
        </span>
      </div>

      {/* space pins */}
      {spaces.map((s) => {
        const active = s.id === selectedId
        return (
          <button
            key={s.id}
            onClick={() => onSelect?.(s.id)}
            style={{ left: `${s.coords.x}%`, top: `${s.coords.y}%` }}
            className={`group absolute z-20 -translate-x-1/2 -translate-y-full transition duration-200 ${
              active ? 'z-30 scale-110' : 'hover:scale-105'
            }`}
            aria-label={`${s.title}, ${rupees(s.pricePerHour)} per hour`}
            aria-pressed={active}
          >
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-card transition ${
                active
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'bg-white text-navy-800 ring-1 ring-navy-100 group-hover:ring-brand-300'
              }`}
            >
              <MapPin className={`h-3 w-3 ${active ? 'text-white' : 'text-brand-600'}`} />
              {rupees(s.pricePerHour)}
            </span>
            <span
              className={`mx-auto block h-2 w-2 -translate-y-1 rotate-45 ${active ? 'bg-brand-600' : 'bg-white'}`}
            />
          </button>
        )
      })}

      {/* controls */}
      <div className="absolute right-3 top-3 z-30 flex flex-col overflow-hidden rounded-xl border border-navy-100 bg-white shadow-soft">
        {[Plus, Minus, Crosshair].map((Icon, i) => (
          <button
            key={i}
            className="p-2.5 text-navy-600 transition hover:bg-navy-50 hover:text-brand-700"
            aria-label={['Zoom in', 'Zoom out', 'Recenter'][i]}
            type="button"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div className="absolute bottom-3 left-3 z-30 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-medium text-navy-500 backdrop-blur">
        Sample map · Google Maps / Mapbox plugs in here
      </div>
    </div>
  )
}
