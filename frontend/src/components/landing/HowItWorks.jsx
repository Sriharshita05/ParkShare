import { Search, CalendarCheck, Car, CreditCard, CheckCircle2 } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import useReveal from '../../hooks/useReveal'

const steps = [
  { icon: Search, title: 'Search', text: 'Enter your destination, like a company name, to find nearby parking.' },
  { icon: CalendarCheck, title: 'Choose & book', text: 'Compare spaces on the map, check price and timings, then book your duration.' },
  { icon: Car, title: 'Park', text: 'Navigate to the location and park your vehicle.' },
  { icon: CreditCard, title: 'Pay', text: 'Payment is calculated on actual duration, hourly or daily.' },
  { icon: CheckCircle2, title: 'Leave', text: 'Check out when you return. The owner is paid, minus the platform fee.' },
]

export default function HowItWorks() {
  const ref = useReveal()
  return (
    <section id="how-it-works" className="container-page scroll-mt-24 py-20">
      <SectionHeading
        eyebrow="How it works"
        title="From search to parked in five steps"
        description="No circling the block. No guesswork on price."
      />
      <ol ref={ref} className="reveal relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent lg:block" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative text-center">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-navy-100 bg-white text-brand-600 shadow-card">
              <s.icon className="h-7 w-7" />
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-900">{s.title}</h3>
            <p className="mx-auto mt-1.5 max-w-[220px] text-sm leading-relaxed text-navy-600">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
