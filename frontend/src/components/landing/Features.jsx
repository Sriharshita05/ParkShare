import { Map, Clock, IndianRupee, ShieldCheck, Star, Building2, Sparkles, TrendingUp } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import useReveal from '../../hooks/useReveal'

const features = [
  { icon: Map, title: 'Map-based search', text: 'See every nearby space with live price pins, sorted by what matters to you.' },
  { icon: Clock, title: 'Real-time availability', text: 'Know what is open right now and book the exact hours you need.' },
  { icon: IndianRupee, title: 'Hourly or daily pricing', text: 'Pay for the time you actually use. Secure UPI, card or wallet checkout.' },
  { icon: Star, title: 'Ratings and reviews', text: 'Honest feedback from other drivers helps you choose with confidence.' },
  { icon: ShieldCheck, title: 'Verified owners', text: 'Owner verification and a reporting system keep listings trustworthy.' },
  { icon: Building2, title: 'Company parking zones', text: 'Companies can offer or subsidise parking for employees and visitors.' },
]

const ai = [
  { icon: Sparkles, title: 'Smart recommendation', text: 'Ranks spaces by distance, price, availability, ratings and your preferences.' },
  { icon: TrendingUp, title: 'Dynamic pricing', text: 'Suggests fair prices from time of day, day of week and local events.' },
]

export default function Features() {
  const ref = useReveal()
  return (
    <section id="features" className="scroll-mt-24 bg-white/60 py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Key features"
          title="Everything drivers and owners need"
          description="Built around trust, convenience and fair earnings."
        />
        <div ref={ref} className="reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="card card-hover p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{f.text}</p>
            </article>
          ))}
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-800 p-8 text-white shadow-lift sm:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-3 lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">Coming in a later phase</span>
              <h3 className="mt-3 text-2xl font-extrabold">Intelligence built in</h3>
              <p className="mt-2 text-sm text-navy-200">Python and scikit-learn models will power recommendations, pricing and demand forecasts.</p>
            </div>
            {ai.map((a) => (
              <div key={a.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <a.icon className="h-6 w-6 text-emerald-300" />
                <h4 className="mt-3 font-bold">{a.title}</h4>
                <p className="mt-1 text-sm text-navy-200">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
