import { useQuery } from '@tanstack/react-query'
import api          from '@/lib/api'

// Fetches the 4 global KPI numbers:
// total_revenue, total_orders, active_restaurants, avg_order_value
//
// Laravel's summary endpoint returns: { data: { total_orders, total_revenue, ... }, meta: {...} }
//
// BUG FIX 1 — wrong URL (no leading slash):
//   api.get('analytics/summary') with baseURL='http://localhost:8000/api/v1' (no trailing slash)
//   resolves to http://localhost:8000/api/analytics/summary → 404.
//   Fixed to '/analytics/summary'.
//
// BUG FIX 2 — double data unwrap:
//   The old code returned `response.data.data` (the inner object).
//   But page.js reads `data?.data` expecting the Laravel wrapper still present.
//   So page.js got `undefined` and all 4 KPI cards showed dashes.
//   Fixed: return `response.data` (keep the { data: {...} } wrapper)
//   so page.js's `data?.data` correctly resolves to the KPI object.

async function fetchGlobalSummary(filters) {
  const response = await api.get('/analytics/summary', { params: filters })
  return response.data   // ← return { data: { total_orders, ... }, meta: {...} }
                         //   page.js then reads  .data  to get the numbers
}

export function useGlobalSummary(filters = {}) {
  return useQuery({
    queryKey: ['global-summary', filters],
    queryFn:  () => fetchGlobalSummary(filters),
  })
}