// A skeleton is a grey pulsing box that matches the shape of the real card.
// We show 4 of these while the KPI data is loading.
export default function KpiCardSkeleton() {
  return (
    <div className="card px-5 py-5 flex flex-col gap-3">
      {/* Fake label bar */}
      <div className="flex items-start justify-between">
        <div className="h-3 w-28 bg-stone-200 rounded animate-pulse" />
        <div className="w-8 h-8 bg-stone-100 rounded-xl animate-pulse" />
      </div>
      {/* Fake number bar */}
      <div className="h-8 w-32 bg-stone-200 rounded animate-pulse" />
      {/* Fake subtitle bar */}
      <div className="h-2 w-20 bg-stone-100 rounded animate-pulse" />
    </div>
  )
}