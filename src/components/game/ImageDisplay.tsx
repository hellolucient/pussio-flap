import Image from 'next/image'
import { useEffect, useState } from 'react'
import { voteStore } from '@/stores/voteStore'

const ImageDisplay = () => {
  const [currentImage, setCurrentImage] = useState('/images/robot-portal.png') // Default image

  useEffect(() => {
    // Update image when vote changes
    const unsubscribe = voteStore.subscribe((vote) => {
      if (vote?.imageUrl) {
        setCurrentImage(vote.imageUrl)
      } else {
        setCurrentImage('/images/robot-portal.png') // Fallback to default
      }
    })

    // Initial image
    const initialVote = voteStore.getCurrentVote()
    if (initialVote?.imageUrl) {
      setCurrentImage(initialVote.imageUrl)
    }

    return unsubscribe
  }, [])

  return (
    <div className="relative w-full h-full">
      <Image
        src={currentImage}
        alt="Current voting image"
        fill
        className="object-contain animate-float"
        priority
      />
    </div>
  )
}

export default ImageDisplay 