const tones = {
  blue: 'bg-brand-50 text-brand-700 border-brand-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  navy: 'bg-navy-50 text-navy-700 border-navy-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
}

export default function Badge({ tone = 'blue', icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}
