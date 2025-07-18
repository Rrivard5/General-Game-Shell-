import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StudentInfo from './pages/StudentInfo'
import PreparationRoom from './pages/PreparationRoom'
import MainRoom from './pages/MainRoom'
import Completion from './pages/Completion'
import WordScramble from './pages/WordScramble'
import InstructorInterface from './components/InstructorInterface'
import { GameProvider } from './context/GameStateContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/student-info" element={<StudentInfo />} />
              
              {/* Protected Room Routes */}
              <Route 
                path="/preparation-room" 
                element={
                  <ProtectedRoute>
                    <PreparationRoom />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/main-room" 
                element={
                  <ProtectedRoute>
                    <MainRoom />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/complete" 
                element={
                  <ProtectedRoute>
                    <Completion />
                  </ProtectedRoute>
                } 
              />
              
              {/* Word Scramble */}
              <Route path="/word-scramble" element={<WordScramble />} />
              
              {/* Instructor Interface */}
              <Route path="/instructor" element={<InstructorInterface />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GameProvider>
  )
}
