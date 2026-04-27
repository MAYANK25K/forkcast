'use client'
import { useState }         from 'react'
import Sidebar              from '@/components/layout/Sidebar'
import TopBar               from '@/components/layout/TopBar'
import KpiCard              from '@/components/dashboard/KpiCard'
import KpiCardSkeleton      from '@/components/dashboard/KpiCardSkeleton'
import Leaderboard          from '@/components/dashboard/Leaderboard'
import RestaurantGrid       from '@/components/catalog/RestaurantGrid'
import { useGlobalSummary } from '@/hooks/useGlobalSummary'
import { DollarSign, ShoppingBag, Store, TrendingUp } from 'lucide-react'

function formatCurrency(n) {
  if (n == null) return null
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function formatCurrencyDecimal(n) {
  if (n == null) return null
  return Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatNumber(n) {
  if (n == null) return null
  return Number(n).toLocaleString()
}

export default function OverviewPage() {
  const [filters, setFilters] = useState({})
  const { data, isLoading }   = useGlobalSummary(filters)
  const summary               = data?.data
  const hasFilters            = Object.keys(filters).length > 0

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col page-shell">
        <TopBar title="Overview" subtitle="Global performance across all restaurants" />

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 md:space-y-8">

          {/* KPI Cards — 2 cols mobile, 4 cols lg+ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
            ) : (
              <>
                <KpiCard accent label="Total Revenue"  value={formatCurrency(summary?.total_revenue)}          sub="All restaurants · all time" icon={DollarSign}  className="stagger-1 animate-fade-up" />
                <KpiCard       label="Total Orders"    value={formatNumber(summary?.total_orders)}              sub="Completed orders"           icon={ShoppingBag} className="stagger-2 animate-fade-up" />
                <KpiCard       label="Avg Order Value" value={formatCurrencyDecimal(summary?.avg_order_value)}  sub="Per completed order"        icon={TrendingUp}  className="stagger-3 animate-fade-up" />
                <KpiCard       label="Active Venues"   value={formatNumber(summary?.active_restaurants)}        sub="Restaurants"                icon={Store}       className="stagger-4 animate-fade-up" />
              </>
            )}
          </div>

          {/* Filter status */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {hasFilters ? 'Showing filtered data' : 'Showing all-time data · no filters active'}
            </p>
            {hasFilters && (
              <button onClick={() => setFilters({})} className="text-xs text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2">
                Clear filters
              </button>
            )}
          </div>

          {/* Leaderboard + Restaurant Grid
              FIX: was lg:flex-row — on Nest Hub (1024px) and iPad (1024px) this kicks
              in but both panels are too narrow at that width inside the overview.
              Changed to xl:flex-row so side-by-side only happens at 1280px+
              where there's enough room for both the leaderboard (w-72) and the grid. */}
          <div className="flex flex-col xl:flex-row gap-5 sm:gap-6 items-start">

            {/* Leaderboard — full width below xl, fixed 272px at xl+ */}
            <div className="w-full xl:w-72 shrink-0">
              <Leaderboard filters={filters} />
            </div>

            {/* Restaurant grid card */}
            <div className="flex-1 min-w-0 w-full">
              <div className="card p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">All restaurants</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Browse and filter all venues</p>
                </div>
                <RestaurantGrid />
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}