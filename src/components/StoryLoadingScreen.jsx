import { useEffect, useState } from 'react'

const loadingMessages = [
  'Gathering the shape of your story...',
  'Painting the world around your thoughts...',
  'Illustrating each page of your tale...',
  'Binding your reflection into a book...',
]

function StoryLoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="story-loading-overlay">
      <div className="story-loading-card">
        <div className="story-loading-orb-wrap">
          <div className="story-loading-orb" />
          <div className="story-loading-ring" />
        </div>

        <h2 className="story-loading-title">Creating your MirrorTale</h2>
        <p className="story-loading-message">{loadingMessages[messageIndex]}</p>
      </div>
    </div>
  )
}

export default StoryLoadingScreen