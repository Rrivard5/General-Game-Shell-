import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'
import { useEffect, useState } from 'react'

export default function Home() {
  const { resetGame } = useGame()
  const navigate = useNavigate()
  const [generalSettings, setGeneralSettings] = useState({
    gameTitle: 'Educational Escape Room',
    gameDescription: 'An interactive learning experience',
    gameEmoji: '🎓',
    subjectArea: 'Education',
    storyTitle: 'URGENT: Investigation Required',
    storyDescription: 'You must investigate and solve puzzles to complete your mission. Time is running out!',
    urgencyLevel: 'urgent',
    actionButtonText: 'Begin Investigation',
    actionButtonEmoji: '🚀'
  })
  
  useEffect(() => {
    // Load general settings from instructor configuration
    const savedSettings = localStorage.getItem('instructor-general-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setGeneralSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Error loading general settings:', error)
      }
    }
  }, [])
  
  const handleStartNewGame = () => {
    resetGame()
    navigate('/student-info')
  }

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'low': return 'from-blue-600 to-blue-700'
      case 'medium': return 'from-yellow-600 to-orange-600'
      case 'high': return 'from-orange-600 to-red-600'
      case 'urgent': return 'from-red-600 to-red-700'
      case 'critical': return 'from-red-700 to-red-900'
      default: return 'from-blue-600 to-green-600'
    }
  }

  const getUrgencyBorderColor = (level) => {
    switch (level) {
      case 'low': return 'border-blue-200'
      case 'medium': return 'border-yellow-200'
      case 'high': return 'border-orange-200'
      case 'urgent': return 'border-red-200'
      case 'critical': return 'border-red-300'
      default: return 'border-blue-200'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {generalSettings.gameEmoji} {generalSettings.gameTitle}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            {generalSettings.subjectArea} • {generalSettings.gameDescription}
          </p>
        </div>

        {/* Story Section */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 ${getUrgencyBorderColor(generalSettings.urgencyLevel)}`}>
          <div className="text-6xl mb-4 animate-pulse-soft">
            {generalSettings.urgencyLevel === 'urgent' || generalSettings.urgencyLevel === 'critical' ? '🚨' : '📚'}
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            generalSettings.urgencyLevel === 'urgent' || generalSettings.urgencyLevel === 'critical' 
              ? 'text-red-600' 
              : 'text-blue-600'
          }`}>
            {generalSettings.storyTitle}
          </h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            {generalSettings.storyDescription}
          </p>
          
          {generalSettings.urgencyLevel && (
            <div className={`bg-gradient-to-r ${
              generalSettings.urgencyLevel === 'urgent' || generalSettings.urgencyLevel === 'critical'
                ? 'from-red-50 to-orange-50 border-red-200'
                : generalSettings.urgencyLevel === 'high'
                ? 'from-orange-50 to-yellow-50 border-orange-200'
                : 'from-blue-50 to-green-50 border-blue-200'
            } border-2 rounded-xl p-6 mt-6`}>
              <h3 className={`text-xl font-bold mb-3 ${
                generalSettings.urgencyLevel === 'urgent' || generalSettings.urgencyLevel === 'critical'
                  ? 'text-red-800'
                  : generalSettings.urgencyLevel === 'high'
                  ? 'text-orange-800'
                  : 'text-blue-800'
              }`}>
                {generalSettings.urgencyLevel === 'urgent' ? '⏰ URGENT PRIORITY' :
                 generalSettings.urgencyLevel === 'critical' ? '🚨 CRITICAL PRIORITY' :
                 generalSettings.urgencyLevel === 'high' ? '⚠️ HIGH PRIORITY' :
                 generalSettings.urgencyLevel === 'medium' ? '📋 MEDIUM PRIORITY' :
                 '📝 STANDARD PRIORITY'}
              </h3>
              <p className={`text-lg ${
                generalSettings.urgencyLevel === 'urgent' || generalSettings.urgencyLevel === 'critical'
                  ? 'text-red-700'
                  : generalSettings.urgencyLevel === 'high'
                  ? 'text-orange-700'
                  : 'text-blue-700'
              }`}>
                Complete your investigation by solving puzzles and analyzing evidence. 
                Work systematically through each area to uncover the truth!
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={handleStartNewGame}
            className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${getUrgencyColor(generalSettings.urgencyLevel)} hover:shadow-xl text-white font-semibold rounded-xl text-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
          >
            <span className="mr-2">{generalSettings.actionButtonEmoji}</span>
            {generalSettings.actionButtonText}
          </button>
          
          <div className="mt-4">
            <Link
              to="/instructor"
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Instructor Portal
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">
            🔍 How to Play
          </h2>
          <ul className="text-blue-700 space-y-2 text-left max-w-2xl mx-auto">
            <li>• Enter your student information to access the experience</li>
            <li>• Navigate through different rooms and environments</li>
            <li>• Investigate interactive elements and solve puzzles</li>
            <li>• Answer questions to gather evidence and clues</li>
            <li>• Work with your team to complete the final challenge</li>
            <li>• Demonstrate your understanding to succeed!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
