import { useState, useEffect, useRef } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { PUSSIO_TOKEN } from '@/lib/token'
import { config } from '@/config/env'
import { voteStore } from '@/stores/voteStore'
import { voteEmitter } from '@/lib/voteEmitter'

const connection = new Connection(config.rpcUrl)

export interface PoolState {
  balance: number
  lastVoteType?: 'pussio' | 'not'
  lastVoteTime?: number
  isProcessing: boolean
}

export function usePoolBalance() {
  const [poolState, setPoolState] = useState<PoolState>({ 
    balance: 0,
    isProcessing: false,
    lastVoteType: undefined,
    lastVoteTime: undefined
  })

  const setIsProcessing = (isProcessing: boolean) => {
    setPoolState(prev => ({ ...prev, isProcessing }))
  }

  const recordVote = (type: 'pussio' | 'not') => {
    console.log('🎯 Recording vote type:', type)
    voteEmitter.emit(type)
  }

  // Poll for balance updates
  useEffect(() => {
    const getPoolBalance = async () => {
      try {
        const poolPubkey = new PublicKey(PUSSIO_TOKEN.poolWallet)
        const mintPubkey = new PublicKey(PUSSIO_TOKEN.mint)
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          poolPubkey,
          { mint: mintPubkey }
        )

        if (tokenAccounts.value.length > 0) {
          const rawBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount
          const newBalance = Number(rawBalance) / Math.pow(10, PUSSIO_TOKEN.decimals)
          
          setPoolState(prev => ({
            ...prev,
            balance: newBalance
          }))
        }
      } catch (error) {
        console.error('Error getting pool balance:', error)
      }
    }

    getPoolBalance()
    const interval = setInterval(getPoolBalance, 2000)
    return () => clearInterval(interval)
  }, [])

  return {
    ...poolState,
    setIsProcessing,
    recordVote
  }
} 