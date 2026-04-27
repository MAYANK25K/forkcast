'use client'
import { useState }          from 'react'
import Sidebar               from '@/components/layout/Sidebar'
import TopBar                from '@/components/layout/TopBar'
import GlobalFilters         from '@/components/filters/GlobalFilters'
import { useLeaderboard }    from '@/hooks/useLeaderboard'
import Link                  from 'next/link'
import { Trophy, Star, MapPin, UtensilsCrossed } from 'lucide-react'
import { clsx }              from 'clsx'

const POSITION_STYLES = [
  { row: 'bg-teal-50 border border-teal-100',     badge: 'bg-teal-600 text-white',     num: 'text-teal-700'   },
  { row: 'bg-slate-50 border border-slate-100',   badge: 'bg-slate-400 text-white',    num: 'text-slate-700'  },
  { row: 'bg-orange-50 border border-orange-100', badge: 'bg-orange-400 text-white',   num: 'text-orange-700' },
]
const DEFAULT_STYLE = { row: 'bg-white border border-stone-100', badge: 'bg-stone-200 text-slate-600', num: 'text-slate-700' }

function fmtCurrency(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function fmtCurrencyDec(n) {
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function LeaderboardPage() {
  const [filters, setFilters] = useState({})
  const { data, isLoading }   = useLeaderboard(filters, 10)
  const entries               = data?.data ?? []

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* page-shell handles responsive margin-left for all breakpoints */}
      <div className="flex-1 flex flex-col page-shell">
        <TopBar title="Leaderboard" subtitle="Top restaurants ranked by total revenue" />

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Trophy size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">Revenue leaderboard</h2>
              <p className="text-xs text-slate-400 mt-0.5">Top 10 venues · click any row to open its dashboard</p>
            </div>
          </div>

          <GlobalFilters onApply={f => setFilters(f)} onClear={() => setFilters({})} />

          <div className="card overflow-hidden">
            {/* Table header — hide order/avg columns on mobile */}
            <div className="grid grid-cols-[2rem_1fr_auto] md:grid-cols-[2rem_1fr_auto_auto_auto] gap-3 md:gap-4 px-4 sm:px-5 py-3 bg-stone-50 border-b border-stone-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>#</span>
              <span>Restaurant</span>
              <span className="hidden md:block text-right">Orders</span>
              <span className="hidden md:block text-right">Avg Order</span>
              <span className="text-right">Revenue</span>
            </div>

            <div className="divide-y divide-stone-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse bg-stone-50/80 mx-4 my-2 rounded-xl" />
                  ))
                : entries.length === 0
                  ? <div className="py-16 text-center text-slate-300 text-sm">No data available</div>
                  : entries.map((entry, i) => {
                      const s = POSITION_STYLES[i] ?? DEFAULT_STYLE
                      return (
                        <Link
                          key={entry.id ?? i}
                          href={`/restaurants/${entry.id}`}
                          className={clsx(
                            'grid grid-cols-[2rem_1fr_auto] md:grid-cols-[2rem_1fr_auto_auto_auto] gap-3 md:gap-4 px-4 sm:px-5 py-4 items-center hover:bg-stone-50/80 transition-colors',
                            i < 3 && 'mx-2 my-1.5 rounded-xl ' + s.row,
                          )}
                        >
                          <span className={clsx('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0', s.badge)}>
                            {i + 1}
                          </span>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{entry.name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><UtensilsCrossed size={10} />{entry.cuisine_type}</span>
                              <span className="hidden sm:flex items-center gap-1"><MapPin size={10} />{entry.location}</span>
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star size={10} fill="currentColor" />
                                <span className="text-slate-500">{entry.rating}</span>
                              </span>
                            </div>
                          </div>

                          <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-slate-700">{Number(entry.total_orders).toLocaleString()}</p>
                            <p className="text-xs text-slate-400">orders</p>
                          </div>

                          <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-slate-700">{fmtCurrencyDec(entry.avg_order_value)}</p>
                            <p className="text-xs text-slate-400">avg order</p>
                          </div>

                          <div className="text-right">
                            <p className={clsx('text-sm font-bold', s.num)}>{fmtCurrency(entry.total_revenue)}</p>
                            <p className="text-xs text-slate-400">revenue</p>
                          </div>
                        </Link>
                      )
                    })
              }
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}