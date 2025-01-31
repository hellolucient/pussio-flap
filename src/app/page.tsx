"use client"

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { motion } from 'framer-motion'
import Image from 'next/image'
import WalletConnect from '@/components/common/WalletConnect'
import LandingPage from '@/components/landing/LandingPage'
import FlappyGame from '@/components/game/FlappyGame'

export default function Home() {
  const { wallet, setWallet } = useWallet()
  const [showLanding, setShowLanding] = useState(true)

  // Debug wallet state changes
  useEffect(() => {
    console.log('Current wallet state in page:', wallet)
  }, [wallet])

  if (showLanding) {
    return <LandingPage onComplete={() => setShowLanding(false)} />
  }

  return (
    <motion.div 
      className="min-h-screen w-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 1,
        ease: "easeInOut" 
      }}
    >
      {/* Background */}
      <div className="fixed inset-0 w-screen h-screen">
        <div className="absolute inset-0 w-full h-full bg-wall1 bg-cover" />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-screen flex flex-col">
        {/* Wallet Connect - positioned absolutely in top right */}
        <div className="absolute top-4 right-4 z-50">
          <WalletConnect 
            wallet={wallet}
            onWalletChange={setWallet}
          />
        </div>

        {/* Hero Section - reduced padding */}
        <section className="pt-10 pb-4 md:pt-16 md:pb-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              {/* PUSSIO logo - smaller on mobile */}
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-green-500/40 animate-glow-pulse" />
                <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
                <div className="relative h-24 md:h-36">
                  <Image
                    src="/images/pussio flaps.png"
                    alt="PUSSIO or NOT?"
                    fill
                    className="object-contain drop-shadow-[0_0_25px_rgba(34,197,94,0.7)]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Game Section - flex-grow to fill available space */}
        <section className="flex-grow py-2 md:py-6 px-2 md:px-4">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <FlappyGame />
          </div>
        </section>
      </div>
    </motion.div>
  )
}
