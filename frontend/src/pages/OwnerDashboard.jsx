import { useEffect, useState } from 'react'
import { IndianRupee, CalendarCheck, Gauge, Star, Plus, TrendingUp, X } from 'lucide-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EarningsChart from '../components/owner/EarningsChart'
import { getOwnerDashboard } from '../services/api'
import { rupees } from '../utils/format'

function Stat({ icon: Icon, label, value, note, tone = 'blue' }) {
  const tones = { blue: 'bg-brand-50 text-brand-600', green: 'bg-emerald-50 text-emerald-600', navy: 'bg-navy-50 text-navy-700' }
  return (
    <div className="card card-hover p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-navy-900">{value}</p>
      {note && <p className="mt-1 text-xs font-semibold text-emerald-600">{note}</p>}
    </div>
  )
}

function ListSpaceModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', address: '', price: '', spots: 1 })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.title.trim() && form.address.trim() && Number(form.price) > 0
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-950/50 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="List a new space">
      <form
        onSubmit={(e) => { e.preventDefault(); if (valid) onSave(form) }}
        className="card w-full max-w-md animate-fade-up p-6 shadow-lift"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">List a new space</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-navy-50" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-4">
          <div><label className="label" htmlFor="t">Space name</label><input id="t" className="input" value={form.title} onChange={set('title')} placeholder="e.g. Covered garage bay" /></div>
          <div><label className="label" htmlFor="a">Address</label><input id="a" className="input" value={form.address} onChange={set('address')} placeholder="Street, sector or landmark" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label" htmlFor="p">Price per hour (₹)</label><input id="p" type="number" min="1" className="input" value={form.price} onChange={set('price')} /></div>
            <div><label className="label" htmlFor="s">Cars</label><input id="s" type="number" min="1" className="input" value={form.spots} onChange={set('spots')} /></div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={!valid}>Publish listing</Button>
        </div>
      </form>
    </div>
  )
}

export default function OwnerDashboard() {
  const [data, setData] = useState(null)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    getOwnerDashboard().then(setData)
  }, [])

  const addListing = (f) => {
    setData((d) => ({
      ...d,
      listings: [{ id: `new-${Date.now()}`, title: f.title, status: 'Pending review', price: Number(f.price), bookings: 0, earnings: 0 }, ...d.listings],
    }))
    setModal(false)
  }

  if (!data) {
    return (
      <div className="container-page grid animate-pulse gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="card h-36" />)}
      </div>
    )
  }
  const { stats, series, listings, bookings } = data

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Owner dashboard</h1>
          <p className="mt-1 text-sm text-navy-500">Track earnings and manage your parking spaces.</p>
        </div>
        <Button icon={Plus} onClick={() => setModal(true)}>List a space</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Earnings this month" value={rupees(stats.earningsMonth)} note={`↑ ${stats.earningsDelta}% vs last month`} />
        <Stat icon={CalendarCheck} label="Bookings" value={stats.bookingsMonth} tone="navy" />
        <Stat icon={Gauge} label="Occupancy" value={`${stats.occupancy}%`} tone="green" />
        <Stat icon={Star} label="Average rating" value={stats.rating.toFixed(1)} tone="navy" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">This week</h2>
            <Badge tone="green" icon={TrendingUp}>Fri is your peak</Badge>
          </div>
          <div className="mt-6"><EarningsChart data={series} /></div>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="font-bold">Your listings</h2>
          <ul className="mt-4 space-y-3">
            {listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between rounded-xl border border-navy-100 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{l.title}</p>
                  <p className="text-xs text-navy-500">{rupees(l.price)}/hr · {l.bookings} bookings</p>
                </div>
                <Badge tone={l.status === 'Active' ? 'green' : l.status === 'Paused' ? 'navy' : 'amber'}>{l.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card mt-5 overflow-hidden">
        <h2 className="p-6 pb-3 font-bold">Recent bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-navy-500">
              <tr>
                {['Booking', 'Driver', 'Space', 'When', 'Amount', 'Status'].map((h) => (
                  <th key={h} scope="col" className="px-6 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {bookings.map((b) => (
                <tr key={b.id} className="transition hover:bg-brand-50/40">
                  <td className="px-6 py-3.5 font-semibold text-navy-900">{b.id}</td>
                  <td className="px-6 py-3.5">{b.driver}</td>
                  <td className="px-6 py-3.5">{b.space}</td>
                  <td className="px-6 py-3.5 text-navy-600">{b.when}</td>
                  <td className="px-6 py-3.5 font-semibold">{rupees(b.amount)}</td>
                  <td className="px-6 py-3.5"><Badge tone={b.status === 'Active' ? 'blue' : 'green'}>{b.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal && <ListSpaceModal onClose={() => setModal(false)} onSave={addListing} />}
    </div>
  )
}
