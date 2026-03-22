import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FaceVideo from '../components/FaceVideo'
import AIMessageBox from '../components/AIMessageBox'
import UserReplyBox from '../components/UserReplyBox'

function ReflectPage() {
  const navigate = useNavigate()

  const [userReply, setUserReply] = useState('')
  const [aiMessage, setAiMessage] = useState('Hi... what should I call you?')
  const [conversationHistory, setConversationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [stage, setStage] = useState('intro')
  const [turnCount, setTurnCount] = useState(0)
  const [userName, setUserName] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (!userReply.trim() || isLoading) return

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
    if (!conversationHistory.length || isGeneratingStory) return

    setIsGeneratingStory(true)

    try {
      const storyRes = await fetch('http://localhost:5001/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
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
          pages: storyData.pages,
        }),
      })

      const imageData = await imageRes.json()

      if (!imageRes.ok) {
        throw new Error(imageData.error || 'Failed to generate images.')
      }

      const finalStory = {
        title: imageData.title || storyData.title,
        theme: imageData.theme || storyData.theme,
        setting: imageData.setting || storyData.setting,
        characterDescription:
          imageData.characterDescription || storyData.characterDescription,
        styleGuide: imageData.styleGuide || storyData.styleGuide,
        pages: imageData.pages,
      }

      navigate('/story', {
        state: { story: finalStory },
      })
    } catch (error) {
      console.error('Story error:', error)
      setAiMessage('I had trouble creating your story. Please try again.')
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const canGenerateStory = turnCount >= 5

  return (
    <main className="reflect-page">
      <section className="reflect-shell">
        <FaceVideo />

        <p className="stage-label">
          {stage === 'intro' && 'Getting to know you'}
          {stage === 'reflection' && 'Reflecting on your day'}
          {stage === 'deeper_reflection' && 'Looking deeper'}
        </p>

        <AIMessageBox message={aiMessage} />

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
              : 'Turn this into a story'}
          </button>
        )}
      </section>
    </main>
  )
}

export default ReflectPage