import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function StoryBook({ pages = [] }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState(1)

  const normalizedPages = useMemo(() => {
    return pages.map((page) => ({
      text: page?.text || 'This page has no story text yet.',
      imagePrompt: page?.imagePrompt || '',
      image: page?.image || '',
    }))
  }, [pages])

  if (!normalizedPages.length) {
    return (
      <div className="storybook-empty">
        <p>No pages were generated for this story yet.</p>
      </div>
    )
  }

  const page = normalizedPages[currentPage]

  function handlePrevious() {
    if (currentPage > 0) {
      setDirection(-1)
      setCurrentPage((prev) => prev - 1)
    }
  }

  function handleNext() {
    if (currentPage < normalizedPages.length - 1) {
      setDirection(1)
      setCurrentPage((prev) => prev + 1)
    }
  }

  return (
    <div className="storybook-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="storybook-page"
          initial={{
            opacity: 0,
            rotateY: direction > 0 ? 25 : -25,
            x: direction > 0 ? 40 : -40,
          }}
          animate={{
            opacity: 1,
            rotateY: 0,
            x: 0,
          }}
          exit={{
            opacity: 0,
            rotateY: direction > 0 ? -20 : 20,
            x: direction > 0 ? -30 : 30,
          }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          <p className="storybook-page-number">
            Page {currentPage + 1} of {normalizedPages.length}
          </p>

          <div className="storybook-image-wrap">
            {page.image ? (
              <img
                src={page.image}
                alt={`Illustration for page ${currentPage + 1}`}
                className="storybook-image"
              />
            ) : (
              <div className="storybook-image storybook-image-fallback">
                Illustration unavailable
              </div>
            )}
          </div>

          <div className="storybook-page-text">
            <p>{page.text}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="storybook-controls">
        <button
          className="storybook-nav-button"
          onClick={handlePrevious}
          disabled={currentPage === 0}
        >
          Previous
        </button>

        <button
          className="storybook-nav-button"
          onClick={handleNext}
          disabled={currentPage === normalizedPages.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default StoryBook