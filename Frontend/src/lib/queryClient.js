import { QueryClient } from '@tanstack/react-query'

// This is the central cache for all API data.
// staleTime: data stays fresh for 60s before re-fetching.
// retry: only retry failed requests once (default is 3x).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

export default queryClient