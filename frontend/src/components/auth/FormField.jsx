import { AlertCircle } from 'lucide-react'

// Accessible labelled input with leading icon, optional trailing control and inline error/hint.
export default function FormField({ id, label, icon: Icon, error, hint, labelAside, right, className = '', ...input }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-navy-800">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="group relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
              error ? 'text-red-400' : 'text-navy-400 group-focus-within:text-brand-600'
            }`}
          />
        )}
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-white/90 py-3 text-sm text-navy-900 placeholder:text-navy-400 transition focus:outline-none focus:ring-4 focus:ring-offset-0 disabled:opacity-60 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${right ? 'pr-12' : 'pr-4'} ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-navy-200 hover:border-navy-300 focus:border-brand-500 focus:ring-brand-100'
          }`}
          {...input}
        />
        {right && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-navy-500">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
