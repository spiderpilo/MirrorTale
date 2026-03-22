import { useEffect, useState } from 'react'

function AIMessageBox({ message, isTyping = false }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    setDisplayedText('')

    if (!message) return

    const interval = setInterval(() => {
      index += 1
      setDisplayedText(message.slice(0, index))

      if (index >= message.length) {
        clearInterval(interval)
      }
    }, 18)

    return () => clearInterval(interval)
  }, [message])

  return (
    <div className="ai-message-box">
      <p className="ai-message-text">{displayedText}</p>
      {isTyping && displayedText.length < message.length && (
        <span className="typing-cursor">|</span>
      )}
    </div>
  )
}

export default AIMessageBox