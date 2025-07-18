import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameStateContext'

export default function PreparationRoom() {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    preparationRoomTitle: 'Preparation Room',
    preparationRoomDescription: 'Complete the preparation challenge to proceed',
    preparationRoomEmoji: '🎯'
  })
  
  const navigate = useNavigate()
  const { studentInfo, trackAttempt } = useGame()

  useEffect(() => {
    loadGeneralSettings()
    loadPreparationQuestion()
  }, [studentInfo])

  const loadGeneralSettings = () => {
    const savedSettings = localStorage.getItem('instructor-general-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setGeneralSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Error loading general settings:', error)
      }
    }
  }

  const loadPreparationQuestion = () => {
    const savedQuestions = localStorage.getItem('instructor-preparation-questions')
    let question = null
    
    if (savedQuestions) {
      try {
        const questions = JSON.parse(savedQuestions)
        const groupQuestions = questions.groups?.[studentInfo?.groupNumber] || questions.groups?.[1]
        if (groupQuestions && groupQuestions.length > 0) {
          question = groupQuestions[0]
        }
      } catch (error) {
        console.error('Error loading preparation questions:', error)
      }
    }
    
    // Default question if none configured
    if (!question) {
      question = {
        id: 'prep_default',
        question: 'What is the most important thing to remember when beginning any investigation?',
        type: 'multiple_choice',
        options: [
          'Work quickly without planning',
          'Follow proper procedures and safety protocols',
          'Skip the preparation phase',
          'Work alone without collaboration'
        ],
        answer: 'Follow proper procedures and safety protocols',
        hint: 'Think about what ensures accuracy and safety in any investigation.',
        clue: 'Preparation protocols understood - access granted'
      }
    }
    
    setCurrentQuestion(question)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!userAnswer.trim()) {
      setFeedback({ type: 'warning', message: 'Please select an answer before submitting.' })
      return
    }

    const isCorrect = checkAnswer(userAnswer, currentQuestion)
    setAttempts(prev => prev + 1)
    
    // Track the attempt
    trackAttempt('preparation-room', currentQuestion.id, userAnswer, isCorrect)
    
    if (isCorrect) {
      setFeedback({ type: 'success', message: '🎉 Correct! You may now proceed to the main investigation area.' })
      setIsComplete(true)
    } else {
      setFeedback({ type: 'error', message: 'Incorrect. Review the concepts and try again.' })
    }
  }

  const checkAnswer = (answer, question) => {
    if (question.type === 'multiple_choice') {
      return question.answer === answer.trim()
    } else {
      return question.answer.toLowerCase() === answer.trim().toLowerCase()
    }
  }

  const proceedToMainRoom = () => {
    if (isComplete) {
      navigate('/main-room')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        
        {/* Room Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
            {generalSettings.preparationRoomEmoji} {generalSettings.preparationRoomTitle}
          </h1>
          <p className="text-blue-700 text-lg">Group {studentInfo?.groupNumber} - {generalSettings.preparationRoomDescription}</p>
        </div>

        {/* Main Room Layout */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-2xl border-4 border-gray-300 min-h-[600px]">
          
          {/* Room Background */}
          <div className="absolute inset-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl opacity-20"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[500px]">
            
            {/* Central Challenge Area */}
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full border border-gray-200">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{generalSettings.preparationRoomEmoji}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Preparation Challenge
                </h2>
                <p className="text-gray-600">
                  Complete this challenge to demonstrate your readiness for the main investigation
                </p>
              </div>

              {/* Question Section */}
              {currentQuestion && !isComplete && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-bold text-blue-800 mb-4 text-lg">{currentQuestion.question}</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {currentQuestion.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <label 
                            key={index}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                              userAnswer === option 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="answer"
                              value={option}
                              checked={userAnswer === option}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              className="mr-3 h-4 w-4 text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={!userAnswer}
                        className={`px-6 py-3 rounded-lg font-bold transition-all ${
                          !userAnswer 
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Submit Answer
                      </button>
                      
                      {!showHint && attempts > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowHint(true)}
                          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition-all"
                        >
                          💡 Show Hint
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Hint Display */}
                  {showHint && currentQuestion?.hint && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-bold text-yellow-800 mb-2">💡 Hint</h4>
                      <p className="text-yellow-700">{currentQuestion.hint}</p>
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback && (
                    <div className={`mt-4 p-4 rounded-lg border-2 ${
                      feedback.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : feedback.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                      <p className="font-medium">{feedback.message}</p>
                    </div>
                  )}

                  {attempts > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Attempts: {attempts}
                    </div>
                  )}
                </div>
              )}

              {/* Success State */}
              {isComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-bold text-green-800 mb-2">Challenge Complete!</h3>
                  <p className="text-green-700 mb-4">
                    You have successfully completed the preparation challenge. 
                    You are now ready to proceed to the main investigation area.
                  </p>
                  <button
                    onClick={proceedToMainRoom}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-all"
                  >
                    Proceed to Main Investigation →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-8 left-8 text-4xl opacity-20">📚</div>
          <div className="absolute top-8 right-8 text-4xl opacity-20">🎯</div>
          <div className="absolute bottom-8 left-8 text-4xl opacity-20">💡</div>
          <div className="absolute bottom-8 right-8 text-4xl opacity-20">🔍</div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">📋 Instructions</h3>
          <ul className="space-y-2 text-sm">
            <li>• Read the question carefully and consider all options</li>
            <li>• Select the answer that best demonstrates your understanding</li>
            <li>• Use the hint if you need additional guidance</li>
            <li>• Successfully complete the challenge to proceed to the main area</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
