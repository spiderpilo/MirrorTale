import { motion } from 'framer-motion'
import './Face.css'

function Face({ mood = 'neutral' }) {
  const moodClass = `face ${mood}`

  return (
    <motion.div
      className="face-wrapper"
      animate={{ scale: [1, 1.015, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="face-ring"
        animate={{ boxShadow: ['0 0 30px rgba(87, 255, 65, 0.15)', '0 0 55px rgba(87, 255, 65, 0.28)', '0 0 30px rgba(87, 255, 65, 0.15)'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className={moodClass}>
          <div className="eyes">
            <div className="eye left-eye" />
            <div className="eye right-eye" />
          </div>

          <div className="eyebrows">
            <div className="eyebrow left-brow" />
            <div className="eyebrow right-brow" />
          </div>

          <div className="mouth" />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Face