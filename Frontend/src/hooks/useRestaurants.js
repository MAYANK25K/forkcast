import { useQuery } from '@tanstack/react-query'
import api          from '@/lib/api'

async function fetchRestaurants(params) {
  const { data } = await api.get('/restaurants', { params })
  return data
}

// Named export — must be called exactly useRestaurants (plural)
export function useRestaurants(params = {}) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn:  () => fetchRestaurants(params),
  })
}