import { Link } from 'react-router-dom'
import { APP_NAME, TAGLINE } from '../config/appConfig'

function HomePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{APP_NAME}</h1>
      <p>{TAGLINE}</p>

      <Link to="/reflect">
        <button>Begin Reflection</button>
      </Link>
    </div>
  )
}

export default HomePage