"use client"

import { createContext, useContext, useState } from 'react'

interface FlapsContextType {
  flapsBalance: number
  addFlaps: (amount: number) => void
}

const FlapsContext = createContext<FlapsContextType>({
  flapsBalance: 0,
  addFlaps: () => {},
})

export function FlapsProvider({ children }: { children: React.ReactNode }) {
  const [flapsBalance, setFlapsBalance] = useState(0)

  const addFlaps = (amount: number) => {
    setFlapsBalance(prev => prev + amount)
  }

  return (
    <FlapsContext.Provider value={{ flapsBalance, addFlaps }}>
      {children}
    </FlapsContext.Provider>
  )
}

export function useFlaps() {
  return useContext(FlapsContext)
} 