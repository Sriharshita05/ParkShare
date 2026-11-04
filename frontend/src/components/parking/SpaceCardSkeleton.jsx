export default function SpaceCardSkeleton() {
  return (
    <div className="card animate-pulse p-4">
      <div className="flex gap-4">
        <div className="h-24 w-24 rounded-xl bg-navy-100" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-navy-100" />
          <div className="h-3 w-full rounded bg-navy-50" />
          <div className="h-3 w-1/2 rounded bg-navy-50" />
        </div>
      </div>
    </div>
  )
}
