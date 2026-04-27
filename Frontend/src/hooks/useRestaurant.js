import { useQuery } from '@tanstack/react-query'
import api          from '@/lib/api'

// Fetches one restaurant by public UUID: GET /api/v1/restaurants/{id}
// Response shape: { data: { id, name, cuisine_type, location, rating, is_active } }
async function fetchRestaurant(id) {
  // BUG FIX: The original called api.get(`restaurants/${id}`) — no leading slash.
  // Same axios baseURL resolution bug as useGlobalSummary: without the leading slash
  // the URL resolves incorrectly. Fixed to `/restaurants/${id}`.
  const response = await api.get(`/restaurants/${id}`)
  return response.data.data
}

export function useRestaurant(id) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn:  () => fetchRestaurant(id),
    enabled:  !!id,
  })
}