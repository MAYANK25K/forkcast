'use client'
import { useState, useMemo }  from 'react'
import { useRestaurants }     from '@/hooks/useRestaurants'
import RestaurantCard         from './RestaurantCard'
import { Search, ArrowUpDown, LayoutGrid, List, X } from 'lucide-react'
import { clsx } from 'clsx'

const SORT_OPTIONS = [
  { value: 'name',         label: 'Name'    },
  { value: 'rating',       label: 'Rating'  },
  { value: 'cuisine_type', label: 'Cuisine' },
]

export default function RestaurantGrid() {
  const [search,    setSearch]    = useState('')
  const [sortBy,    setSortBy]    = useState('name')
  const [direction, setDirection] = useState('asc')
  const [viewMode,  setViewMode]  = useState('grid')

  const { data, isLoading, isFetching } = useRestaurants({
    search:    search || undefined,
    sort_by:   sortBy,
    direction,
    per_page:  20,
  })

  const restaurants = data?.data ?? []

  const activeChips = useMemo(() => {
    const chips = []
    if (search)              chips.push({ key: 'search', label: `"${search}"`,                                             clear: () => setSearch('')       })
    if (sortBy !== 'name')   chips.push({ key: 'sort',   label: `Sort: ${SORT_OPTIONS.find(o => o.value===sortBy)?.label}`, clear: () => setSortBy('name')   })
    if (direction !== 'asc') chips.push({ key: 'dir',    label: 'Descending',                                              clear: () => setDirection('asc') })
    return chips
  }, [search, sortBy, direction])

  const stats = useMemo(() => {
    if (!restaurants.length) return null
    const avg   = (restaurants.reduce((s, r) => s + Number(r.rating), 0) / restaurants.length).toFixed(1)
    const cuisi = new Set(restaurants.map(r => r.cuisine_type)).size
    return { count: restaurants.length, avg, cuisi }
  }, [restaurants])

  return (
    <div className="space-y-4">

      {/* Stats strip */}
      {!isLoading && stats && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm">
            {stats.count} {stats.count === 1 ? 'venue' : 'venues'}
          </span>
          <span className="text-xs text-slate-500 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm">
            Avg rating {stats.avg} ★
          </span>
          <span className="text-xs text-slate-500 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm">
            {stats.cuisi} cuisine {stats.cuisi === 1 ? 'type' : 'types'}
          </span>
          {isFetching && !isLoading && (
            <span className="text-xs text-teal-500 animate-pulse">Updating…</span>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[120px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search restaurants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-7 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-xs sm:text-sm px-2 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-teal-400 shadow-sm"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Direction */}
        <button
          onClick={() => setDirection(d => d === 'asc' ? 'desc' : 'asc')}
          className={clsx(
            'p-2 rounded-xl border transition-colors shadow-sm shrink-0',
            direction === 'desc'
              ? 'bg-teal-50 border-teal-200 text-teal-600'
              : 'bg-white border-stone-200 text-slate-500 hover:text-teal-600 hover:border-teal-300',
          )}
        >
          <ArrowUpDown size={14} />
        </button>

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 p-1 bg-stone-100 rounded-xl shrink-0">
          {[['grid', LayoutGrid], ['list', List]].map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'p-1.5 rounded-lg transition-all',
                viewMode === mode ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Active:</span>
          {activeChips.map(chip => (
            <button
              key={chip.key}
              onClick={chip.clear}
              className="flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full hover:bg-teal-100 transition-colors"
            >
              {chip.label} <X size={10} />
            </button>
          ))}
          {activeChips.length > 1 && (
            <button
              onClick={() => { setSearch(''); setSortBy('name'); setDirection('asc') }}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-44 animate-pulse bg-stone-100/80" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-14 animate-pulse bg-stone-100/80" />
            ))}
          </div>
        )
      ) : restaurants.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Search size={20} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600">No restaurants found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search term or clear your filters.</p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-xs text-teal-600 font-medium hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // FIX: grid-cols-1 on tiny screens (< 380px, e.g. 320px viewport)
        //      grid-cols-2 from 380px (most phones in portrait)
        //      grid-cols-3 from sm (640px+)
        // This prevents the ~148px card width at 320px that caused
        // "View Dashboard" to wrap and overlap the rating star.
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 gap-3">
          {restaurants.map((r, i) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              listView={false}
              style={{
                animationName:           'fadeUp',
                animationDuration:       '0.3s',
                animationTimingFunction: 'ease',
                animationFillMode:       'forwards',
                animationDelay:          `${i * 0.05}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {restaurants.map((r, i) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              listView={true}
              style={{
                animationName:           'fadeUp',
                animationDuration:       '0.3s',
                animationTimingFunction: 'ease',
                animationFillMode:       'forwards',
                animationDelay:          `${i * 0.04}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}