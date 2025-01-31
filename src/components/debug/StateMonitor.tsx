import React, { useState, useEffect } from 'react'
import { voteStore } from '../../stores/voteStore'

const StateMonitor = () => {
  const [state, setState] = useState({})
  
  useEffect(() => {
    const interval = setInterval(() => {
      setState({
        currentVote: voteStore.getCurrentVote(),
        voteCounts: voteStore.getVoteCounts(),
        localStorage: localStorage.getItem('currentVote')
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return process.env.NODE_ENV === 'development' ? (
    <pre className="fixed bottom-4 left-4 text-xs opacity-50">
      {JSON.stringify(state, null, 2)}
    </pre>
  ) : null
}

export default StateMonitor 