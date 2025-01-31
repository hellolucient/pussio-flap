"use client"

import { useEffect, useState } from 'react'

const VoteGauge = () => {
  const [position, setPosition] = useState<number>(50) // 0-100 scale
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Simulate random fluctuations
  useEffect(() => {
    const fluctuate = () => {
      if (!isAnimating) {
        setPosition(prev => {
          const change = Math.random() * 6 - 3 // Random value between -3 and 3
          const newPos = Math.max(40, Math.min(60, prev + change)) // Keep between 40-60
          return newPos
        })
      }
    }
    
    const interval = setInterval(fluctuate, 100)
    return () => clearInterval(interval)
  }, [isAnimating])

  // Simulate vote animation
  const simulateVote = (isPussio: boolean) => {
    setIsAnimating(true)
    const target = isPussio ? 100 : 0
    
    // Quickly animate to target
    setPosition(target)
    
    // Then return to center and resume fluctuation
    setTimeout(() => {
      setPosition(50)
      setTimeout(() => {
        setIsAnimating(false)
      }, 500)
    }, 1000)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-1 md:space-y-2">
      {/* Gauge Bar */}
      <div className="h-4 md:h-6 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm p-1">
        <div className="relative h-full w-full rounded-full overflow-hidden">
          {/* Background gradient - reversed colors */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-red-500" />
          
          {/* Center line */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/30" />
          
          {/* Needle/Indicator */}
          <div 
            className="absolute inset-y-0 w-1 bg-white shadow-lg shadow-white/50 transition-all duration-300 ease-out"
            style={{ 
              left: `${position}%`,
              transform: 'translateX(-50%)',
            }}
          />
          
          {/* Glow effect for needle */}
          <div 
            className="absolute inset-y-0 w-3 blur-sm bg-white/50 transition-all duration-300 ease-out"
            style={{ 
              left: `${position}%`,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs md:text-sm font-bold">
        <div className="text-green-400">PUSSIO</div>
        <div className="text-red-400">BOSS</div>
      </div>

      {/* Testing Buttons - Remove in production */}
      <div className="flex justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
        <button onClick={() => simulateVote(true)} className="text-xs">
          Test PUSSIO
        </button>
        <button onClick={() => simulateVote(false)} className="text-xs">
          Test NOT
        </button>
      </div>
    </div>
  )
}

export default VoteGauge 