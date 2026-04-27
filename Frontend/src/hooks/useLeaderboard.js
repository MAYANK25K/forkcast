import { useQuery } from '@tanstack/react-query'
import api          from '@/lib/api'

// Fetches the top N restaurants by revenue.
// limit defaults to 3 (top 3).
async function fetchLeaderboard({ filters, limit }) {
  const { data } = await api.get('/analytics/leaderboard', {
    params: { ...filters, limit },
  })
  return data
}

export function useLeaderboard(filters = {}, limit = 3) {
  return useQuery({
    queryKey: ['leaderboard', filters, limit],
    queryFn:  () => fetchLeaderboard({ filters, limit }),
  })
}