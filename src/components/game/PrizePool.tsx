"use client"

import { usePoolBalance } from '@/hooks/usePoolBalance'
import { useEffect, useState, useRef } from 'react'
import { voteEmitter } from '@/lib/voteEmitter'

const PrizePool = () => {
  const { balance, isProcessing } = usePoolBalance()
  const [timeLeft, setTimeLeft] = useState(3600)
  const [isFlashing, setIsFlashing] = useState(false)
  const [prevBalance, setPrevBalance] = useState(balance)
  const [flashType, setFlashType] = useState<'pussio' | 'not' | undefined>(undefined)
  const pendingVoteRef = useRef<'pussio' | 'not' | undefined>(undefined)

  // Listen for vote events
  useEffect(() => {
    console.log('Setting up vote event listener')
    const unsubscribe = voteEmitter.subscribe(type => {
      console.log('💫 Vote event received in PrizePool:', type)
      pendingVoteRef.current = type
      setFlashType(type)
      setIsFlashing(true)
    })
    console.log('Vote listener setup complete')
    return unsubscribe
  }, [])

  // Handle balance changes
  useEffect(() => {
    if (Math.floor(balance) !== Math.floor(prevBalance)) {
      console.log('💰 Balance updated, clearing flash state')
      setPrevBalance(balance)
      // Only clear the flash if this balance change matches our pending vote
      if (pendingVoteRef.current) {
        setIsFlashing(false)
        setFlashType(undefined)
        pendingVoteRef.current = undefined
      }
    }
  }, [balance, prevBalance])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 3600))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="absolute right-2 md:right-4 top-2 md:top-4">
      <div className="px-3 py-2 md:px-4 md:py-3 bg-black/20 rounded-lg backdrop-blur-sm border border-cyan-500/30">
        <div className="text-xs md:text-sm uppercase tracking-wider text-cyan-400/80">
          CURRENT PRIZE POOL
        </div>
        <div className="text-lg md:text-xl font-mono font-bold text-cyan-400">
          {Math.floor(balance).toLocaleString()} <span className="text-xs">$PUSSIO</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-cyan-400/80">
          <span>Voting Closes:</span>
          <span className="font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>
    </div>
  )
}

export default PrizePool 