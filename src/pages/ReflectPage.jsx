import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture'
import FaceVideo from '../components/FaceVideo'
import AIMessageBox from '../components/AIMessageBox'
import UserReplyBox from '../components/UserReplyBox'
import StoryLoadingScreen from '../components/StoryLoadingScreen'

function ReflectPage() {
  const navigate = useNavigate()

  const [userPhoto, setUserPhoto] = useState('')
  const [hasCapturedPhoto, setHasCapturedPhoto] = useState(false)

  const [userReply, setUserReply] = useState('')
  const [aiMessage, setAiMessage] = useState('Hi... what should I call you?')
  const [conversationHistory, setConversationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [stage, setStage] = useState('intro')
  const [turnCount, setTurnCount] = useState(0)
  const [userName, setUserName] = useState('')

  function handlePhotoCapture(imageDataUrl) {
    setUserPhoto(imageDataUrl)
    setHasCapturedPhoto(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!userReply.trim() || isLoading || !hasCapturedPhoto) return

    const currentReply = userReply

    if (stage === 'intro' && !userName) {
      setUserName(currentReply)
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5001/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: currentReply,
          conversationHistory,
          stage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.')
      }

      const updatedTurnCount = turnCount + 1

      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: currentReply },
        { role: 'assistant', content: data.reply },
      ])

      setAiMessage(data.reply)
      setUserReply('')
      setTurnCount(updatedTurnCount)

      if (stage === 'intro') {
        setStage('reflection')
      } else if (stage === 'reflection' && updatedTurnCount >= 4) {
        setStage('deeper_reflection')
      }
    } catch (error) {
      console.error('Reflect error:', error)
      setAiMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateStory() {
    if (!conversationHistory.length || isGeneratingStory || !userPhoto) return

    setIsGeneratingStory(true)

    try {
      const storyRes = await fetch('http://localhost:5001/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          userPhoto,
          conversationHistory,
        }),
      })

      const storyData = await storyRes.json()

      if (!storyRes.ok) {
        throw new Error(storyData.error || 'Failed to generate story.')
      }

      const imageRes = await fetch('http://localhost:5001/api/story-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: storyData.title,
          theme: storyData.theme,
          setting: storyData.setting,
          characterDescription: storyData.characterDescription,
          styleGuide: storyData.styleGuide,
          appearanceProfile: storyData.appearanceProfile,
          userPhoto,
          pages: storyData.pages,
        }),
      })

      const imageData = await imageRes.json()

      if (!imageRes.ok) {
        throw new Error(imageData.error || 'Failed to generate images.')
      }

      navigate('/story', {
        state: {
          story: {
            title: imageData.title || storyData.title,
            theme: imageData.theme || storyData.theme,
            setting: imageData.setting || storyData.setting,
            characterDescription:
              imageData.characterDescription || storyData.characterDescription,
            styleGuide: imageData.styleGuide || storyData.styleGuide,
            appearanceProfile:
              imageData.appearanceProfile || storyData.appearanceProfile,
            pages: imageData.pages,
          },
        },
      })
    } catch (error) {
      console.error('Story error:', error)
      setAiMessage('I had trouble creating your story. Please try again.')
      setIsGeneratingStory(false)
    }
  }

  const canGenerateStory = hasCapturedPhoto && turnCount >= 5

  return (
    <>
      {isGeneratingStory && <StoryLoadingScreen />}

      <main className="reflect-page">
        <section className="reflect-shell">
          {!hasCapturedPhoto ? (
            <>
              <div className="camera-intro-copy">
                <h1 className="camera-intro-title">Take a mirror photo</h1>
                <p className="camera-intro-text">
                  Capture your face first so your story can be illustrated around you.
                </p>
              </div>

              <CameraCapture onCapture={handlePhotoCapture} />
            </>
          ) : (
            <>
              <FaceVideo />

              <p className="stage-label">
                {stage === 'intro' && 'Getting to know you'}
                {stage === 'reflection' && 'Reflecting on your day'}
                {stage === 'deeper_reflection' && 'Looking deeper'}
              </p>

              <AIMessageBox message={aiMessage} isTyping={isLoading} />

              <UserReplyBox
                value={userReply}
                onChange={(e) => setUserReply(e.target.value)}
                onSubmit={handleSubmit}
                disabled={isLoading || isGeneratingStory}
              />

              {canGenerateStory && (
                <button
                  className="story-button"
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                >
                  {isGeneratingStory
                    ? 'Illustrating your story...'
                    : '✨ Turn this into a story'}
                </button>
              )}
            </>
          )}
        </section>
      </main>
    </>
  )
}

export default ReflectPage