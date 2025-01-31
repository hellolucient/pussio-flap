"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FlapsProvider } from '@/contexts/FlapsContext'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <FlapsProvider>
        {children}
      </FlapsProvider>
    </QueryClientProvider>
  )
} 