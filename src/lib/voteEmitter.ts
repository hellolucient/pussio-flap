type VoteType = 'pussio' | 'not'

class VoteEmitter {
  private listeners: ((type: VoteType) => void)[] = []

  emit(type: VoteType) {
    console.log('🎯 Emitting vote type:', type)
    this.listeners.forEach(listener => listener(type))
  }

  subscribe(callback: (type: VoteType) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }
}

// Make sure we export a singleton instance
export const voteEmitter = new VoteEmitter() 