function FaceVideo() {
  return (
    <div className="face-wrapper">
      <div className="face-ring">
        <video className="face-video" autoPlay muted loop playsInline>
          <source src="/face-loop.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  )
}

export default FaceVideo