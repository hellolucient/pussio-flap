"use client"

import { useEffect, useState, useRef } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { ADMIN_WALLETS } from '@/config/env'
import { voteStore } from '@/stores/voteStore'
import { usePoolBalance } from '@/hooks/usePoolBalance'
import Image from 'next/image'

const AdminPanel = () => {
  const { wallet } = useWallet()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState(60)
  const [currentVote, setCurrentVote] = useState(() => {
    const initial = voteStore.getCurrentVote()
    console.log('Initial vote state in admin:', initial)
    return initial
  })
  const [voteCounts, setVoteCounts] = useState(voteStore.getVoteCounts())
  const poolState = usePoolBalance()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    // Add debug logging
    console.log('Admin wallet addresses:', ADMIN_WALLETS)
    console.log('Current wallet:', wallet?.publicKey?.toString())
    console.log('Is authorized:', isAuthorized)
    console.log('Current vote:', currentVote)
    console.log('Vote counts:', voteCounts)

    if (wallet?.publicKey) {
      const isAdmin = ADMIN_WALLETS.includes(wallet.publicKey.toString())
      setIsAuthorized(isAdmin)
    } else {
      setIsAuthorized(false)
    }
  }, [wallet])

  // Add vote subscription
  useEffect(() => {
    const unsubscribe = voteStore.subscribe((vote) => {
      console.log('Vote update in admin:', vote)
      setCurrentVote(vote)
      setVoteCounts(voteStore.getVoteCounts())
    })
    return unsubscribe
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setImageUrl(`/images/${file.name}`) // This will be the path after we save it
    }
  }

  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploadedImage) {
      // In production, you'd upload to a server
      // For now, we'll just use the file name and assume it's in public/images/
      console.log('Image to be manually added:', uploadedImage.name)
    }

    const newVote = {
      id: Date.now().toString(),
      imageUrl: imageUrl || previewUrl,
      startTime: Date.now(),
      endTime: Date.now() + (duration * 60 * 1000),
      votes: []
    }

    voteStore.setCurrentVote(newVote)
    setImageUrl('')
    setPreviewUrl('')
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleEndVote = () => {
    voteStore.setCurrentVote(null)
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-red-400">Unauthorized Access</h1>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      
      {/* Create New Vote */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Create New Vote</h2>
        <form onSubmit={handleCreateVote} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Image Upload</label>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-2"
            />
            <p className="text-xs text-gray-400">or</p>
            <input 
              type="text" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-black/20 rounded px-3 py-2 mt-2"
              placeholder="Image URL (e.g., /images/pussio1.png)"
            />
          </div>

          {/* Image Preview */}
          {(previewUrl || imageUrl) && (
            <div className="relative w-48 h-48 rounded-lg overflow-hidden">
              <Image
                src={previewUrl || imageUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div>
            <label className="block text-sm">Duration (minutes)</label>
            <input 
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-black/20 rounded px-3 py-2"
            />
          </div>

          <button 
            type="submit"
            disabled={!imageUrl && !previewUrl}
            className="px-4 py-2 bg-green-500 rounded disabled:opacity-50"
          >
            Start New Vote
          </button>
        </form>
      </section>

      {/* Current Vote Status */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Current Vote Status</h2>
        
        {/* Add Prize Pool Display */}
        <div className="p-4 bg-black/20 rounded-lg space-y-2">
          <h3 className="text-lg font-medium text-cyan-400">Prize Pool</h3>
          <div className="text-2xl font-mono">
            {poolState.balance.toLocaleString()} $PUSSIO
          </div>
          {poolState.lastVoteType && (
            <div className="text-sm text-gray-400">
              Last vote: {poolState.lastVoteType} ({new Date(poolState.lastVoteTime || 0).toLocaleString()})
            </div>
          )}
        </div>

        {currentVote ? (
          <div className="space-y-2">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden">
              <Image
                src={currentVote.imageUrl}
                alt="Current vote"
                fill
                className="object-cover"
              />
            </div>
            <div>PUSSIO Votes: {voteCounts.pussio}</div>
            <div>NOT Votes: {voteCounts.not}</div>
            <div>Time Remaining: {Math.max(0, Math.floor((currentVote.endTime - Date.now()) / 1000 / 60))} minutes</div>
            <button 
              onClick={handleEndVote}
              className="px-4 py-2 bg-red-500 rounded"
            >
              End Vote Early
            </button>
          </div>
        ) : (
          <div>No active vote</div>
        )}
      </section>

      {/* Vote History */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Vote History</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="py-2 px-4 font-medium">Wallet</th>
                <th className="py-2 px-4 font-medium">Vote</th>
                <th className="py-2 px-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {currentVote?.votes.map(vote => (
                <tr key={vote.wallet + vote.timestamp} className="border-b border-gray-800/50">
                  <td className="py-2 px-4 font-mono text-sm">
                    {vote.wallet.slice(0, 4)}...{vote.wallet.slice(-4)}
                  </td>
                  <td className="py-2 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded ${
                      vote.voteType === 'pussio' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {vote.voteType}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-400">
                    {new Date(vote.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminPanel 