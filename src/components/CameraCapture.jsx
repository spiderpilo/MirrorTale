import { useEffect, useRef, useState } from 'react'

function CameraCapture({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(true)

  useEffect(() => {
    let stream

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1024 },
            height: { ideal: 1024 },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setIsStarting(false)
      } catch (err) {
        console.error('Camera error:', err)
        setError('Camera access was denied or unavailable.')
        setIsStarting(false)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const size = 1024

    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, size, size)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92)
    onCapture(imageDataUrl)

    const stream = video.srcObject
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  return (
    <div className="camera-stage">
      <div className="camera-ring">
        <div className="camera-circle">
          {isStarting && <p className="camera-status">Starting camera…</p>}

          {error && !isStarting && (
            <p className="camera-status camera-error">{error}</p>
          )}

          {!error && (
            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              muted
              playsInline
            />
          )}
        </div>
      </div>

      <button className="capture-button" onClick={handleCapture} disabled={!!error || isStarting}>
        Capture
      </button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default CameraCapture