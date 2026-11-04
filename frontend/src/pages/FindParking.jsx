import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPinOff } from 'lucide-react'
import MapView from '../components/parking/MapView'
import SpaceCard from '../components/parking/SpaceCard'
import SpaceCardSkeleton from '../components/parking/SpaceCardSkeleton'
import { searchSpaces } from '../services/api'

const sorts = [
  { id: 'best', label: 'Best match' },
  { id: 'distance', label: 'Nearest' },
  { id: 'price', label: 'Cheapest' },
  { id: 'rating', label: 'Top rated' },
]

const chips = ['CCTV', 'Covered', 'EV-ready', 'Security guard']

export default function FindParking() {
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('best')
  const [filters, setFilters] = useState([])
  const [maxPrice, setMaxPrice] = useState(50)
  const [selectedId, setSelectedId] = useState(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    let alive = true
    searchSpaces({ q: query }).then((data) => {
      if (!alive) return
      setAll(data)
      setSelectedId(data[0]?.id ?? null)
      setLoading(false)
    })
    return () => {
      alive = false
    }
    // Load once; filtering is client-side for the sample data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const results = useMemo(() => {
    let list = all.filter((s) => s.pricePerHour <= maxPrice && filters.every((f) => s.amenities.includes(f)))
    const q = query.trim().toLowerCase()
    if (q) {
      const hit = list.filter((s) => `${s.title} ${s.address} ${s.landmark}`.toLowerCase().includes(q))
      // Free text that matches nothing falls back to all nearby results, like a map search would.
      if (hit.length) list = hit
    }
    const score = (s) => s.rating * 20 - s.distanceM / 50 - s.pricePerHour
    const sorters = {
      best: (a, b) => score(b) - score(a),
      distance: (a, b) => a.distanceM - b.distanceM,
      price: (a, b) => a.pricePerHour - b.pricePerHour,
      rating: (a, b) => b.rating - a.rating,
    }
    return [...list].sort(sorters[sort])
  }, [all, filters, maxPrice, query, sort])

  const toggle = (c) => setFilters((f) => (f.includes(c) ? f.filter((x) => x !== c) : [...f, c]))

  return (
    <div className="container-page py-6 lg:py-8">
      <div className="card mb-5 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-navy-200 bg-white px-4 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
          <Search className="h-5 w-5 text-brand-600" />
          <span className="sr-only">Search destination</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a destination, company or area"
            className="w-full bg-transparent py-3 text-sm focus:outline-none"
          />
        </label>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="hidden h-4 w-4 text-navy-500 sm:block" />
          <label className="flex items-center gap-2 text-xs font-semibold text-navy-600">
            Max ₹{maxPrice}/hr
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="w-32 accent-brand-600"
              aria-label="Maximum price per hour"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-sm font-semibold text-navy-700"
            aria-label="Sort results"
          >
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => toggle(c)}
            aria-pressed={filters.includes(c)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filters.includes(c)
                ? 'border-brand-600 bg-brand-600 text-white shadow-glow'
                : 'border-navy-200 bg-white text-navy-600 hover:border-brand-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between lg:hidden">
        <p className="text-sm font-semibold text-navy-700">{results.length} spaces nearby</p>
        <button
          onClick={() => setShowMap((v) => !v)}
          className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700"
        >
          {showMap ? 'Show list' : 'Show map'}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,480px)_1fr]">
        <div className={`space-y-3 lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto lg:pr-2 ${showMap ? 'hidden lg:block' : ''}`}>
          <p className="hidden text-sm font-semibold text-navy-700 lg:block">{results.length} spaces nearby</p>
          {loading && [0, 1, 2].map((i) => <SpaceCardSkeleton key={i} />)}
          {!loading && results.length === 0 && (
            <div className="card flex flex-col items-center p-10 text-center">
              <MapPinOff className="h-10 w-10 text-navy-300" />
              <h3 className="mt-3 font-bold text-navy-900">No spaces match</h3>
              <p className="mt-1 text-sm text-navy-500">Try raising the price limit or removing a filter.</p>
            </div>
          )}
          {results.map((s) => (
            <SpaceCard key={s.id} space={s} selected={s.id === selectedId} onSelect={setSelectedId} />
          ))}
        </div>
        <div className={`${showMap ? '' : 'hidden'} lg:block`}>
          <MapView
            spaces={results}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="h-[460px] lg:sticky lg:top-24 lg:h-[calc(100vh-15rem)]"
          />
        </div>
      </div>
    </div>
  )
}
