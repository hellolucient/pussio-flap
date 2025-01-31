"use client"

import { createContext, useContext, useState } from 'react'
import type { WalletContextType, Wallet } from '@/types'

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  setWallet: () => {
    // This is intentionally empty
    return undefined
  }
})

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext) 