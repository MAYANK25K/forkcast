'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools }  from '@tanstack/react-query-devtools'
import queryClient            from '@/lib/queryClient'

// This wraps the entire app so every component can use
// useQuery / useMutation hooks to fetch data.
export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools panel — only visible in development, not in production */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}