"use client"

import { FlapsProvider } from '@/contexts/FlapsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FlapsProvider>
      {children}
    </FlapsProvider>
  )
} 