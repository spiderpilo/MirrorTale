import { Link, useLocation } from 'react-router-dom'
import StoryBook from '../components/StoryBook'

function StoryPageView() {
  const location = useLocation()
  const story = location.state?.story

  if (!story) {
    return (
      <main className="story-page">
        <section className="story-shell">
          <h1 className="story-title">No story found</h1>
          <p className="story-empty-text">
            Complete a reflection first, then generate your tale.
          </p>
          <Link to="/" className="story-link-button">
            Return
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="story-page">
      <section className="story-shell">
        <h1 className="story-title">{story.title || 'Your Mirror Tale'}</h1>

        <StoryBook pages={story.pages || []} />

        <Link to="/" className="story-link-button">
          Reflect again
        </Link>
      </section>
    </main>
  )
}

export default StoryPageView