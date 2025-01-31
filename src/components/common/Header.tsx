"use client"

import Link from 'next/link'
import WalletConnect from './WalletConnect'
import { useWallet } from '@/contexts/WalletContext'
import { ADMIN_WALLETS } from '@/config/env'

const Header = () => {
  const { wallet, setWallet } = useWallet()
  const isAdmin = wallet?.publicKey && ADMIN_WALLETS.includes(wallet.publicKey.toString())

  const handleWalletChange = (newWallet: any) => {
    setWallet(newWallet)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-end">
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link 
              href="/admin"
              className="px-4 py-2 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              Admin Panel
            </Link>
          )}
          <WalletConnect 
            wallet={wallet}
            onWalletChange={handleWalletChange}
          />
        </div>
      </div>
    </header>
  )
}

export default Header 