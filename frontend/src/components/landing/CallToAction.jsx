import Button from '../ui/Button'
import { ArrowRight } from 'lucide-react'

export default function CallToAction() {
  return (
    <section className="container-page pb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900 px-6 py-14 text-center text-white shadow-lift sm:px-12">
        <div className="dot-grid absolute inset-0 opacity-20 invert" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Turning unused spaces into opportunities</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Park smarter today, or list your space in under five minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/find" variant="secondary" size="lg" icon={ArrowRight}>
              Find parking
            </Button>
            <Button to="/owner" variant="dark" size="lg">
              List your space
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
