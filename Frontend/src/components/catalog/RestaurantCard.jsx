import Link                           from 'next/link'
import { Star, MapPin, ChevronRight } from 'lucide-react'
import { clsx }                       from 'clsx'

const CUISINE_COLORS = {
  'Japanese':     'bg-purple-50  text-purple-700  border-purple-100',
  'North Indian': 'bg-orange-50  text-orange-700  border-orange-100',
  'Italian':      'bg-yellow-50  text-yellow-700  border-yellow-100',
  'American':     'bg-blue-50    text-blue-700    border-blue-100',
  'Mexican':      'bg-yellow-50  text-yellow-700  border-yellow-100',
}

export default function RestaurantCard({ restaurant, style, listView = false }) {
  const badge = CUISINE_COLORS[restaurant.cuisine_type] ?? 'bg-stone-100 text-slate-600 border-stone-200'
  const href  = `/restaurants/${restaurant.id}`

  // ── List view ────────────────────────────────────────────────
  if (listView) {
    return (
      <Link
        href={href}
        style={style}
        className="card px-3 py-3 flex items-center gap-3 group hover:shadow-md transition-all duration-200"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm shrink-0">
          {restaurant.name[0]}
        </div>

        {/* Name + location — takes all remaining space, truncates */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
            {restaurant.name}
          </p>
          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
            <MapPin size={10} className="shrink-0" />
            <span className="text-xs truncate">{restaurant.location}</span>
          </div>
        </div>

        {/* Rating — hidden on very small screens */}
        <div className="hidden xs:flex items-center gap-1 shrink-0">
          <Star size={11} fill="#f59e0b" className="text-amber-400" />
          <span className="text-xs font-semibold text-slate-700">{restaurant.rating}</span>
        </div>

        {/* Cuisine badge — only on md+ */}
        <span className={clsx('hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0', badge)}>
          {restaurant.cuisine_type}
        </span>

        {/* Arrow — always visible, text hidden on xs */}
        <span className="text-teal-600 flex items-center shrink-0">
          <ChevronRight size={15} />
        </span>
      </Link>
    )
  }

  // ── Grid / card view ─────────────────────────────────────────
  // Root problem: at 320px viewport the 2-col grid gives ~148px per card.
  // The bottom row "★ 4.8  View Dashboard ›" runs out of space and wraps,
  // overlapping the rating star. Fix strategy:
  //   1. Reduce padding from p-5 → p-3 so content has room to breathe
  //   2. Stack the bottom row vertically (flex-col) so rating and CTA
  //      never compete for the same horizontal line
  //   3. Keep the layout flex-col with flex-1 on the middle section so
  //      the bottom always sits at the card's natural bottom edge
  return (
    <Link
      href={href}
      style={style}
      className="card p-3 flex flex-col gap-2 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-up h-full"
    >
      {/* Top: avatar + cuisine badge */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 text-base font-semibold shrink-0">
          {restaurant.name[0]}
        </div>
        <span className={clsx(
          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 leading-tight mt-0.5',
          badge,
        )}>
          {restaurant.cuisine_type}
        </span>
      </div>

      {/* Middle: name + location — flex-1 pushes footer to bottom */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug break-words">
          {restaurant.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-slate-400">
          <MapPin size={10} className="shrink-0" />
          <span className="text-xs truncate">{restaurant.location}</span>
        </div>
      </div>

      {/* Bottom: rating + CTA stacked vertically — no horizontal competition */}
      <div className="pt-2 border-t border-stone-100 flex flex-col gap-1.5">
        {/* Rating row */}
        <div className="flex items-center gap-1">
          <Star size={11} fill="#f59e0b" className="text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">{restaurant.rating}</span>
        </div>

        {/* CTA — full width button feel, left-aligned text + arrow on right */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-teal-600 font-medium">View Dashboard</span>
          <ChevronRight size={13} className="text-teal-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}