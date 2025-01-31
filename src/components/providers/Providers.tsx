"use client"

import { AbstractWalletProvider } from '@abstract-foundation/agw-react'
import { validChains } from '@abstract-foundation/agw-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/contexts/WalletContext'

const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()
  
  console.log('Valid chains:', validChains)
  
  return (
    <QueryClientProvider client={queryClient}>
      <AbstractWalletProvider
        chain={validChains[Object.keys(validChains)[0]]} // Use first valid chain
        queryClient={queryClient}
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </AbstractWalletProvider>
    </QueryClientProvider>
  )
}

export default Providers 