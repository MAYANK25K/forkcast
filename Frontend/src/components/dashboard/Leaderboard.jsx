'use client'
import Link             from 'next/link'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Trophy }         from 'lucide-react'
import { clsx }           from 'clsx'

// LeaderboardResource returns:
//   { rank, id (public_id), name, cuisine_type, location, rating, total_orders, total_revenue, avg_order_value }
// The old code used entry.restaurant_name and entry.restaurant_id — both undefined.

const RANK_STYLES = [
  { card: 'bg-teal-50 border border-teal-100',   avatar: 'bg-teal-100 text-teal-700',   rank: 'bg-teal-100 text-teal-700',   rev: 'text-teal-700' },
  { card: 'bg-slate-50 border border-slate-100', avatar: 'bg-slate-200 text-slate-600', rank: 'bg-slate-200 text-slate-600', rev: 'text-slate-700' },
  { card: 'bg-slate-50 border border-slate-100', avatar: 'bg-slate-100 text-slate-500', rank: 'bg-slate-100 text-slate-500', rev: 'text-slate-600' },
]

export default function Leaderboard({ filters = {} }) {
  const { data, isLoading } = useLeaderboard(filters, 3)
  const entries = data?.data ?? []

  return (
    <div className="card p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
          <Trophy size={14} className="text-amber-600" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 leading-tight">Top restaurants</h3>
          <p className="text-xs text-slate-400">By total revenue</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
            ))
          : entries.map((entry, i) => {
              const style   = RANK_STYLES[i] ?? RANK_STYLES[2]
              // FIX: API returns `name` not `restaurant_name`
              const initial = entry.name?.[0] ?? '?'
              const revenue = Number(entry.total_revenue).toLocaleString('en-US', {
                style: 'currency', currency: 'USD', maximumFractionDigits: 0,
              })

              return (
                // FIX: API returns `id` (the public UUID) not `restaurant_id`
                // Wrap in a Link so clicking navigates to the restaurant dashboard
                <Link
                  key={entry.id ?? i}
                  href={`/restaurants/${entry.id}`}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl hover:opacity-80 transition-opacity',
                    style.card
                  )}
                >
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0', style.avatar)}>
                    {initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* FIX: entry.name not entry.restaurant_name */}
                    <p className="text-sm font-medium text-slate-900 truncate">{entry.name}</p>
                    <p className="text-xs text-slate-400">{entry.total_orders} orders</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={clsx('text-sm font-semibold', style.rev)}>{revenue}</p>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded-md font-medium', style.rank)}>
                      #{i + 1}
                    </span>
                  </div>
                </Link>
              )
            })}
      </div>
    </div>
  )
}