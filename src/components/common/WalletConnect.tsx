"use client"

import { useState, useEffect } from 'react'
import { getTokenBalance } from '@/lib/token'
import { Wallet } from '@/types'
import { PhantomProvider } from '@/types/phantom'

interface WalletConnectProps {
  wallet: Wallet | null
  onWalletChange: (wallet: Wallet | null) => void
}

const WalletConnect = ({ wallet, onWalletChange }: WalletConnectProps) => {
  const [publicKey, setPublicKey] = useState('')
  const [balance, setBalance] = useState(0)
  const [phantom, setPhantom] = useState<PhantomProvider['solana'] | null>(null)

  // Initialize Phantom
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const solana = window?.phantom?.solana
      if (solana) {
        setPhantom(solana)
        // If already connected, maintain the connection
        if (solana.isConnected) {
          setPublicKey(solana.publicKey.toString())
          onWalletChange(solana)
        }
      }
    }
  }, [onWalletChange])

  // Update state when wallet changes
  useEffect(() => {
    if (wallet?.isConnected) {
      setPublicKey(wallet.publicKey.toString())
      updateBalance(wallet)
    } else {
      setPublicKey('')
      setBalance(0)
    }
  }, [wallet])

  const updateBalance = async (currentWallet: Wallet) => {
    if (currentWallet?.isConnected) {
      try {
        const balance = await getTokenBalance(currentWallet)
        console.log('Current PUSSIO balance:', balance)
        setBalance(balance)
      } catch (error) {
        console.error('Error getting balance:', error)
      }
    }
  }

  const connectWallet = async () => {
    try {
      console.log('Connecting wallet...')
      if (phantom) {
        const { publicKey } = await phantom.connect()
        console.log('Connected with public key:', publicKey.toString())
        onWalletChange(phantom)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      onWalletChange(null)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (phantom) {
        await phantom.disconnect()
        onWalletChange(null)
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  if (!phantom) {
    return (
      <a
        href="https://phantom.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
      >
        Get Phantom
      </a>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {wallet?.isConnected && (
        <div className="px-3 py-1.5 bg-black/30 rounded-lg backdrop-blur-sm">
          <span className="text-sm font-mono text-cyan-400">
            {balance} $PUSSIO
          </span>
        </div>
      )}
      <button
        onClick={wallet?.isConnected ? disconnectWallet : connectWallet}
        className="group relative px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg overflow-hidden transition-all hover:scale-105"
      >
        <div className="absolute inset-0 bg-cyan-400/20 animate-pulse group-hover:bg-cyan-400/30" />
        <span className="relative text-sm font-medium">
          {wallet?.isConnected ? 
            `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : 
            'Connect Wallet'
          }
        </span>
      </button>
    </div>
  )
}

export default WalletConnect 