import { Car, Home, Building, Landmark, Leaf, Wallet, Timer, Users } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import useReveal from '../../hooks/useReveal'

const stakeholders = [
  { icon: Car, title: 'Drivers', text: 'Find and book parking close to where they are going.' },
  { icon: Home, title: 'Parking owners', text: 'List unused space and earn income.' },
  { icon: Building, title: 'Companies', text: 'Give employees and visitors nearby parking, and subsidise costs.' },
  { icon: Landmark, title: 'Authorities', text: 'Reduce illegal parking and manage traffic better.' },
]

const benefits = [
  { icon: Timer, text: 'Saves time for drivers' },
  { icon: Wallet, text: 'Extra income for homeowners' },
  { icon: Users, text: 'Supports companies and local communities' },
  { icon: Leaf, text: 'Less fuel wasted searching for parking' },
]

export default function Audience() {
  const ref = useReveal()
  return (
    <section className="container-page py-20">
      <SectionHeading
        eyebrow="Who it is for"
        title="One platform, four winners"
        description="Parking is a shared problem, so the benefits are shared too."
      />
      <div ref={ref} className="reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stakeholders.map((s) => (
          <article key={s.title} className="card card-hover p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 text-white shadow-soft">
              <s.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-bold text-navy-900">{s.title}</h3>
            <p className="mt-1.5 text-sm text-navy-600">{s.text}</p>
          </article>
        ))}
      </div>
      <ul className="mt-8 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <li key={b.text} className="flex items-center gap-3 text-sm font-semibold text-emerald-800">
            <b.icon className="h-5 w-5 shrink-0 text-emerald-600" />
            {b.text}
          </li>
        ))}
      </ul>
    </section>
  )
}
