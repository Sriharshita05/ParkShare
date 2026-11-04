import { Link } from 'react-router-dom'
import { BadgeCheck, Clock, Car, Zap, Camera, Shield, Umbrella } from 'lucide-react'
import Badge from '../ui/Badge'
import Rating from '../ui/Rating'
import { rupees, distance } from '../../utils/format'

const toneBg = {
  blue: 'from-brand-100 to-brand-200',
  emerald: 'from-emerald-100 to-emerald-200',
  navy: 'from-navy-100 to-navy-200',
}

const demandBadge = {
  high: { tone: 'amber', label: 'High demand' },
  medium: { tone: 'blue', label: 'Moderate demand' },
  low: { tone: 'green', label: 'Easy to book' },
}

const amenityIcon = { CCTV: Camera, 'EV-ready': Zap, Covered: Umbrella, 'Security guard': Shield }

export function SpaceThumb({ space, className = 'h-24 w-24' }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${toneBg[space.tone]} ${className}`}
    >
      <div className="absolute inset-0 dot-grid opacity-60" />
      <Car className="relative h-9 w-9 text-navy-700" />
      <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-navy-700">
        {space.type}
      </span>
    </div>
  )
}

export default function SpaceCard({ space, selected, onSelect }) {
  const demand = demandBadge[space.demand]
  return (
    <div
      onClick={() => onSelect?.(space.id)}
      className={`card card-hover cursor-pointer p-4 ${selected ? '!border-brand-500 ring-4 ring-brand-100' : ''}`}
    >
      <div className="flex gap-4">
        <SpaceThumb space={space} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-bold text-navy-900">{space.title}</h3>
            <div className="text-right">
              <div className="font-display text-lg font-extrabold leading-none text-brand-700">
                {rupees(space.pricePerHour)}
                <span className="text-xs font-medium text-navy-500">/hr</span>
              </div>
            </div>
          </div>
          <p className="mt-1 truncate text-sm text-navy-500">
            {distance(space.distanceM)} from {space.landmark} · {space.address}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Rating value={space.rating} count={space.reviews} />
            {space.owner.verified && (
              <Badge tone="green" icon={BadgeCheck}>
                Verified
              </Badge>
            )}
            <Badge tone={demand.tone}>{demand.label}</Badge>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-navy-50 pt-3">
        <div className="flex items-center gap-3 text-xs text-navy-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {space.window}
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            {space.amenities.slice(0, 3).map((a) => {
              const Icon = amenityIcon[a]
              return Icon ? <Icon key={a} className="h-3.5 w-3.5" title={a} /> : null
            })}
          </span>
        </div>
        <Link
          to={`/space/${space.id}`}
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
        >
          View & book
        </Link>
      </div>
    </div>
  )
}
