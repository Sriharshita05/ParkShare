import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">This spot is empty</h1>
      <p className="mt-2 text-navy-500">The page you are looking for does not exist.</p>
      <Button to="/" className="mt-8">Back home</Button>
    </div>
  )
}
