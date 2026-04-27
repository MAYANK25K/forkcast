'use client'
import { useState }       from 'react'
import { useAnalytics }   from '@/hooks/useAnalytics'
import KpiCard            from './KpiCard'
import KpiCardSkeleton    from './KpiCardSkeleton'
import DailyOrdersChart   from './DailyOrdersChart'
import DailyRevenueChart  from './DailyRevenueChart'
import PeakHourChart      from './PeakHourChart'
import GlobalFilters      from '@/components/filters/GlobalFilters'
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Star,
  UtensilsCrossed,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react'

function fmtCurrency(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  })
}
function fmtCurrencyDecimal(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })
}
function fmtNumber(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString()
}

// publicId — the restaurant's public_id taken from the URL segment
export default function RestaurantDashboard({ publicId }) {
  const [filters, setFilters] = useState({})

  const { data, isLoading, isError, error, refetch } = useAnalytics(publicId, filters)

  // The API wraps the payload in a top-level `data` key (Laravel API Resource)
  const payload    = data?.data
  const restaurant = payload?.restaurant
  const summary    = payload?.summary
  // daily_metrics is the array used for the two trend charts
  const dailyData  = payload?.daily_metrics ?? []
  // peak_hours is the per-day heatmap array
  const peakHours  = payload?.peak_hours    ?? []

  // ── Error state ──────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="card p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Failed to load dashboard</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {error?.message || 'The server returned an error. Make sure your backend is running and the database is seeded.'}
        </p>
        <p className="text-xs text-slate-400">
          API:{' '}
          <code className="bg-stone-100 px-1.5 py-0.5 rounded text-slate-600">
            {process.env.NEXT_PUBLIC_API_URL}/restaurants/{publicId}/analytics
          </code>
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-medium hover:underline mt-1"
        >
          <RefreshCcw size={12} /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Restaurant info strip ── */}
      {isLoading ? (
        <div className="card px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-200 animate-pulse" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-40 bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      ) : restaurant ? (
        <div className="card px-5 py-4 flex flex-wrap items-center gap-4 animate-fade-up">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 text-xl font-bold shrink-0">
            {restaurant.name?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              {restaurant.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <UtensilsCrossed size={11} />
                {restaurant.cuisine_type}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {restaurant.location}
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={11} fill="currentColor" />
                <span className="text-slate-600 font-medium">{restaurant.rating}</span>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Filters ── */}
      <GlobalFilters
        onApply={f  => setFilters(f)}
        onClear={() => setFilters({})}
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              accent
              label="Total Revenue"
              value={fmtCurrency(summary?.total_revenue)}
              sub="Completed orders"
              icon={DollarSign}
              className="stagger-1 animate-fade-up"
            />
            <KpiCard
              label="Total Orders"
              value={fmtNumber(summary?.total_orders)}
              sub="Completed orders"
              icon={ShoppingBag}
              className="stagger-2 animate-fade-up"
            />
            <KpiCard
              label="Avg Order Value"
              value={fmtCurrencyDecimal(summary?.avg_order_value)}
              sub="Per completed order"
              icon={TrendingUp}
              className="stagger-3 animate-fade-up"
            />
          </>
        )}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyOrdersChart  data={dailyData} isLoading={isLoading} />
        <DailyRevenueChart data={dailyData} isLoading={isLoading} />
      </div>

      {/* ── Peak hour heatmap ── */}
      <PeakHourChart data={peakHours} isLoading={isLoading} />

    </div>
  )
}