import { rupees } from '../../utils/format'

// Lightweight SVG-free bar chart; no chart library needed at this stage.
export default function EarningsChart({ data }) {
  const max = Math.max(...data.map((d) => d.value))
  const peak = data.find((d) => d.value === max)
  return (
    <figure>
      <div className="flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label={`Weekly earnings, peak ${peak.label} at ${rupees(max)}`}>
        {data.map((d) => {
          const isPeak = d.value === max
          return (
            <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-navy-500 opacity-0 transition group-hover:opacity-100">
                {rupees(d.value)}
              </span>
              <div
                style={{ height: `${(d.value / max) * 100}%` }}
                className={`w-full rounded-t-lg transition duration-300 group-hover:brightness-110 ${
                  isPeak ? 'bg-gradient-to-t from-brand-600 to-brand-400' : 'bg-gradient-to-t from-brand-200 to-brand-100'
                }`}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs text-navy-500">{d.label}</span>
        ))}
      </div>
    </figure>
  )
}
