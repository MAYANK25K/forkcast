import Link                          from 'next/link'
import { ArrowLeft, Star, MapPin }   from 'lucide-react'
import { clsx }                      from 'clsx'

const CUISINE_COLORS = {
  'Japanese':     'bg-purple-50  text-purple-700  border-purple-100',
  'North Indian': 'bg-orange-50  text-orange-700  border-orange-100',
  'Italian':      'bg-yellow-50  text-yellow-700  border-yellow-100',
  'American':     'bg-blue-50    text-blue-700    border-blue-100',
}

export default function RestaurantHeader({ restaurant, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-3 w-16 bg-stone-200 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-stone-200 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-28 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) return null

  // Support both "cuisine" and "cuisine_type" field names
  const cuisine = restaurant.cuisine_type ?? restaurant.cuisine ?? ''
  const badgeStyle = CUISINE_COLORS[cuisine] ?? 'bg-stone-100 text-slate-600 border-stone-200'

  return (
    <div className="space-y-3">
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to restaurants
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 text-2xl font-bold shrink-0">
          {restaurant.name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {restaurant.name}
            </h1>
            {cuisine && (
              <span className={clsx('text-xs font-semibold px-2.5 py-0.5 rounded-full border', badgeStyle)}>
                {cuisine}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
            {restaurant.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {restaurant.location}
              </span>
            )}
            {restaurant.rating && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star size={11} fill="currentColor" />
                <span className="text-slate-700">{restaurant.rating}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}