"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const LandingPage = ({ onComplete }: { onComplete: () => void }) => {
  const [isDissolving, setIsDissolving] = useState(false)

  const handleClick = () => {
    setIsDissolving(true)
    setTimeout(onComplete, 500)
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {!isDissolving ? (
          <motion.div
            className="relative w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/images/landing.png"
              alt="PUSSIO Landing"
              fill
              className="object-cover"
              priority
            />
            
            {/* PUSSIO logo with ENTER button */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl flex flex-col items-center">
              {/* Logo container with effects */}
              <div className="w-full relative">
                {/* Glow effect */}
                <div className="absolute inset-0 blur-3xl bg-green-500/40 animate-glow-pulse" />
                
                {/* Noise overlay */}
                <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
                
                {/* Logo */}
                <div className="relative h-72 md:h-96 w-full">
                  <Image
                    src="/images/PUSSIO.png"
                    alt="PUSSIO or NOT?"
                    fill
                    className="object-contain drop-shadow-[0_0_25px_rgba(34,197,94,0.7)]"
                    priority
                  />
                </div>
              </div>

              {/* Enter Button */}
              <button
                onClick={handleClick}
                className="mt-0 px-16 py-4 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 
                         rounded-lg text-pink-300 text-2xl font-black tracking-widest transition-all duration-300
                         hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20
                         drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]
                         animate-pulse-fast
                         relative
                         after:absolute after:inset-0 after:bg-pink-500/20 after:blur-lg after:animate-pulse-glow"
              >
                <span className="relative z-10 drop-shadow-[0_0_15px_rgba(236,72,153,1)]">
                  wen WL!
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="relative w-full h-full"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ 
              duration: 1,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/images/landing.png"
              alt="PUSSIO Landing"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LandingPage 