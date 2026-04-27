import { useQuery } from '@tanstack/react-query'
import api          from '@/lib/api'

// GET /api/v1/restaurants/{publicId}/analytics
// Response shape:
// {
//   data: {
//     restaurant:    { id, name, cuisine_type, location, rating, is_active }
//     summary:       { total_orders, total_revenue, avg_order_value }
//     daily_metrics: [{ date, order_count, revenue, avg_order_value }]
//     peak_hours:    [{ date, peak_hour, order_count }]
//     filters_applied: { ... }
//   }
// }
async function fetchAnalytics({ publicId, filters }) {
  const clean = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  const { data } = await api.get(`/restaurants/${publicId}/analytics`, { params: clean })
  return data
}

export function useAnalytics(publicId, filters = {}) {
  return useQuery({
    queryKey: ['analytics', publicId, filters],
    queryFn:  () => fetchAnalytics({ publicId, filters }),
    enabled:  !!publicId,
    retry: 1,
  })
}