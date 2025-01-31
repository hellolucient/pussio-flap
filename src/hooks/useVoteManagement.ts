import { useState, useEffect } from 'react'
import { Vote } from '@/types'
import { voteStore } from '@/stores/voteStore'

export function useVoteManagement() {
  const [currentVote, setCurrentVote] = useState<Vote | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen to current vote
  useEffect(() => {
    const unsubscribe = voteStore.subscribe((vote) => {
      if (vote) {
        // Ensure vote type is correct before setting
        const validatedVote: Vote = {
          ...vote,
          votes: vote.votes.map(v => ({
            ...v,
            voteType: v.voteType as 'pussio' | 'not'
          }))
        }
        setCurrentVote(validatedVote)
      } else {
        setCurrentVote(null)
      }
      setIsLoading(false)
    })

    // Initial state
    const initialVote = voteStore.getCurrentVote()
    if (initialVote) {
      const validatedVote: Vote = {
        ...initialVote,
        votes: initialVote.votes.map(v => ({
          ...v,
          voteType: v.voteType as 'pussio' | 'not'
        }))
      }
      setCurrentVote(validatedVote)
    }
    setIsLoading(false)

    return unsubscribe
  }, [])

  const createVote = async (imageUrl: string, durationMinutes: number) => {
    try {
      const vote = {
        id: Date.now().toString(),
        imageUrl,
        startTime: Date.now(),
        endTime: Date.now() + (durationMinutes * 60 * 1000),
        votes: []
      }

      voteStore.setCurrentVote(vote)
      return true
    } catch (error) {
      console.error('Error creating vote:', error)
      return false
    }
  }

  const recordVote = async (wallet: string, voteType: 'pussio' | 'not') => {
    try {
      const vote = {
        wallet,
        voteType,
        timestamp: Date.now()
      }

      const currentVote = voteStore.getCurrentVote()
      if (!currentVote) return false

      currentVote.votes.push(vote)
      voteStore.setCurrentVote(currentVote)

      return true
    } catch (error) {
      console.error('Error recording vote:', error)
      return false
    }
  }

  return {
    currentVote,
    isLoading,
    createVote,
    recordVote
  }
} 