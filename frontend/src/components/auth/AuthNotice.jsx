import { AlertCircle, Info } from 'lucide-react'

const tones = {
  error: { box: 'border-red-200 bg-red-50 text-red-800', icon: AlertCircle, iconClass: 'text-red-500', role: 'alert' },
  info: { box: 'border-brand-200 bg-brand-50 text-navy-800', icon: Info, iconClass: 'text-brand-600', role: 'status' },
}

export default function AuthNotice({ tone = 'info', title, children }) {
  const t = tones[tone]
  const Icon = t.icon
  return (
    <div role={t.role} className={`animate-fade-up flex gap-3 rounded-xl border p-3.5 text-sm ${t.box}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${t.iconClass}`} aria-hidden="true" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p className={title ? 'mt-0.5 text-[13px] leading-relaxed opacity-90' : 'leading-relaxed'}>{children}</p>
      </div>
    </div>
  )
}
