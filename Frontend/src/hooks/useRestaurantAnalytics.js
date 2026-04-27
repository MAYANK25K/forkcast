import { useQuery } from '@tanstack/react-query'
import api          from '@/lib/api'

// BUG FIX: This file originally called three endpoints that do NOT exist:
//   GET /analytics/daily          → 404
//   GET /analytics/peak-hours     → 404
//   GET /analytics/summary        → returns GLOBAL data, not per-restaurant
//
// The correct per-restaurant endpoint is:
//   GET /api/v1/restaurants/{publicId}/analytics
//
// It returns a single payload:
//   {
//     data: {
//       restaurant:    { id, name, cuisine_type, location, rating, is_active }
//       summary:       { total_orders, total_revenue, avg_order_value }
//       daily_metrics: [{ date, order_count, revenue, avg_order_value }]
//       peak_hours:    [{ date, peak_hour, order_count }]
//       filters_applied: { ... }
//     }
//   }
//
// All three hooks now delegate to this single endpoint and slice the response.
// Note: RestaurantDashboard.jsx and GlobalDashboard.jsx already use useAnalytics
// (from useAnalytics.js) which calls the correct endpoint directly. These hooks
// exist for any component that needs to consume individual slices separately.

async function fetchRestaurantAnalytics({ publicId, filters }) {
  const clean = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  const { data } = await api.get(`/restaurants/${publicId}/analytics`, { params: clean })
  return data
}

export function useRestaurantSummary(publicId, filters = {}) {
  return useQuery({
    queryKey: ['restaurant-summary', publicId, filters],
    queryFn:  async () => {
      const res = await fetchRestaurantAnalytics({ publicId, filters })
      return res?.data?.summary ?? null
    },
    enabled: !!publicId,
  })
}

export function useDailyMetrics(publicId, filters = {}) {
  return useQuery({
    queryKey: ['daily-metrics', publicId, filters],
    queryFn:  async () => {
      const res = await fetchRestaurantAnalytics({ publicId, filters })
      return res?.data?.daily_metrics ?? []
    },
    enabled: !!publicId,
  })
}

export function usePeakHours(publicId, filters = {}) {
  return useQuery({
    queryKey: ['peak-hours', publicId, filters],
    queryFn:  async () => {
      const res = await fetchRestaurantAnalytics({ publicId, filters })
      return res?.data?.peak_hours ?? []
    },
    enabled: !!publicId,
  })
}