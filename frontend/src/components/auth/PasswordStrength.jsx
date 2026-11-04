import { passwordStrength } from '../../utils/validation'

const colors = ['bg-navy-100', 'bg-red-400', 'bg-amber-400', 'bg-brand-500', 'bg-emerald-500']

export default function PasswordStrength({ value }) {
  const { score, label } = passwordStrength(value)
  if (!value) return null
  return (
    <div className="mt-2.5 flex items-center gap-3" role="status" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= score ? colors[score] : 'bg-navy-100'}`}
          />
        ))}
      </div>
      <span className="w-16 text-right text-xs font-semibold text-navy-600">{label}</span>
    </div>
  )
}
