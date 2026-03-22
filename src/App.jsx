import { Routes, Route } from 'react-router-dom'
import ReflectPage from './pages/ReflectPage'
import StoryPageView from './pages/StoryPageView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ReflectPage />} />
      <Route path="/story" element={<StoryPageView />} />
    </Routes>
  )
}

export default App