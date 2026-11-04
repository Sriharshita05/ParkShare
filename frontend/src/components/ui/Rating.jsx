import { Star } from 'lucide-react'

export default function Rating({ value, count, size = 'sm' }) {
  const s = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy-800">
      <Star className={`${s} fill-amber-400 text-amber-400`} />
      {value.toFixed(1)}
      {count != null && <span className="font-normal text-navy-500">({count})</span>}
    </span>
  )
}
