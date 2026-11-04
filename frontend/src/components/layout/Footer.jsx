import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

export default function Footer() {
  return (
    <footer className="mt-24 bg-navy-950 text-navy-200">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light tagline />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-300">
            Turning unused spaces into opportunities. ParkShare connects drivers with homeowners and companies who
            have parking to spare.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Product</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" to="/find">Find parking</Link></li>
            <li><Link className="hover:text-white" to="/owner">List your space</Link></li>
            <li><Link className="hover:text-white" to="/active">Active parking</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><a className="hover:text-white" href="/#how-it-works">How it works</a></li>
            <li><a className="hover:text-white" href="/#features">Features</a></li>
            <li><Link className="hover:text-white" to="/auth">Log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-400 sm:flex-row sm:justify-between">
          <span>© 2026 ParkShare. Demo build with sample data.</span>
          <span>Payments run in Razorpay test mode.</span>
        </div>
      </div>
    </footer>
  )
}
