import { Link, useLocation } from 'react-router-dom'
import { usePDF, Resolution, Margin } from 'react-to-pdf'
import StoryBook from '../components/StoryBook'

function StoryPageView() {
  const location = useLocation()
  const story = location.state?.story

  const { toPDF, targetRef } = usePDF({
    filename: `${story?.title || 'MirrorTale Story'}.pdf`,
    resolution: Resolution.HIGH,
    page: {
      margin: Margin.SMALL,
      format: 'letter',
      orientation: 'portrait',
    },
    canvas: {
      mimeType: 'image/png',
      qualityRatio: 1,
    },
  })

  if (!story) {
    return (
      <main className="story-page">
        <section className="story-shell">
          <h1 className="story-title">No story found</h1>
          <p className="story-empty-text">
            Complete a reflection first, then generate your tale.
          </p>
          <Link to="/" className="story-action-button secondary">
            Return
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="story-page">
      <section className="story-shell">
        <div ref={targetRef} className="pdf-export-area">
          <h1 className="story-title">{story.title || 'Your Mirror Tale'}</h1>

          {story.theme && (
            <p className="story-meta-line">Theme: {story.theme}</p>
          )}

          <StoryBook pages={story.pages || []} />
        </div>

        <div className="story-actions">
          <button className="story-action-button primary" onClick={() => toPDF()}>
            Export story as PDF
          </button>

          <Link to="/" className="story-action-button secondary">
            Reflect again
          </Link>
        </div>
      </section>
    </main>
  )
}

export default StoryPageView