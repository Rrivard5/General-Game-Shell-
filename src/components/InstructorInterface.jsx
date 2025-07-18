import { useState, useEffect, useRef } from 'react'

export default function InstructorInterface() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('general')
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    gameTitle: '',
    gameDescription: '',
    gameEmoji: '',
    subjectArea: '',
    storyTitle: '',
    storyDescription: '',
    urgencyLevel: '',
    actionButtonText: '',
    actionButtonEmoji: '',
    preparationRoomTitle: '',
    preparationRoomDescription: '',
    preparationRoomEmoji: '',
    mainRoomTitle: '',
    mainRoomDescription: '',
    mainRoomEmoji: '',
    completionTitle: '',
    completionDescription: '',
    completionEmoji: '',
    finalWordChallenge: '',
    instructorPassword: 'educator2024'
  })
  
  // Room setup state
  const [roomImages, setRoomImages] = useState({})
  const [selectedWall, setSelectedWall] = useState('north')
  const [roomElements, setRoomElements] = useState({})
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [showElementModal, setShowElementModal] = useState(false)
  const [editingElement, setEditingElement] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  
  // Word scramble state
  const [wordSettings, setWordSettings] = useState({
    targetWord: '',
    numGroups: 15,
    groupLetters: {}
  })
  
  // Student progress state
  const [studentProgress, setStudentProgress] = useState([])
  const [studentData, setStudentData] = useState([])
  
  // Feedback settings
  const [feedbackSettings, setFeedbackSettings] = useState({
    questionFeedback: {},
    generalFeedback: {
      excellent: 'Outstanding work! You demonstrate excellent understanding.',
      good: 'Good job! You show solid understanding with room for minor improvements.',
      needs_improvement: 'Consider reviewing the material and practicing more.',
      poor: 'Please review the fundamental concepts and seek additional help.'
    }
  })
  
  // Game settings
  const [gameSettings, setGameSettings] = useState({
    completionMode: 'all',
    finalElementId: '',
    finalQuestion: null
  })
  
  // Preparation room settings
  const [preparationSettings, setPreparationSettings] = useState({
    groups: {}
  })
  
  // Final question state
  const [finalQuestionSettings, setFinalQuestionSettings] = useState({
    groups: {}
  })
  
  // Canvas refs
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  
  const wallOptions = ['north', 'east', 'south', 'west']
  
  const elementTypes = {
    equipment: 'Equipment/Tools',
    furniture: 'Furniture',
    decoration: 'Decorative Items',
    safety: 'Safety Equipment',
    storage: 'Storage Items',
    chemical: 'Chemical/Materials',
    document: 'Documents/Information',
    computer: 'Technology/Electronics',
    specimen: 'Specimens/Samples',
    other: 'Other Objects'
  }
  
  const interactionTypes = {
    none: 'Decorative Only (No Interaction)',
    info: 'Reveal Information Only',
    question: 'Show Question → Reveal Information'
  }
  
  const defaultIcons = {
    equipment: '⚙️',
    furniture: '🪑',
    decoration: '🎨',
    safety: '⚠️',
    storage: '📦',
    chemical: '🧪',
    document: '📄',
    computer: '💻',
    specimen: '🔬',
    other: '❓'
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData()
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    const savedPassword = generalSettings.instructorPassword || 'educator2024'
    if (password === savedPassword) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('Incorrect password')
    }
  }

  const loadAllData = () => {
    try {
      // Load general settings
      const savedGeneralSettings = localStorage.getItem('instructor-general-settings')
      if (savedGeneralSettings) {
        setGeneralSettings(JSON.parse(savedGeneralSettings))
      }
      
      // Load room images
      const savedImages = localStorage.getItem('instructor-room-images')
      if (savedImages) {
        setRoomImages(JSON.parse(savedImages))
      }
      
      // Load room elements
      const savedElements = localStorage.getItem('instructor-room-elements')
      if (savedElements) {
        setRoomElements(JSON.parse(savedElements))
      }
      
      // Load word settings
      const savedWordSettings = localStorage.getItem('instructor-word-settings')
      if (savedWordSettings) {
        setWordSettings(JSON.parse(savedWordSettings))
      } else {
        setDefaultWordSettings()
      }
      
      // Load game settings
      const savedGameSettings = localStorage.getItem('instructor-game-settings')
      if (savedGameSettings) {
        setGameSettings(JSON.parse(savedGameSettings))
      }
      
      // Load preparation settings
      const savedPreparationSettings = localStorage.getItem('instructor-preparation-questions')
      if (savedPreparationSettings) {
        setPreparationSettings(JSON.parse(savedPreparationSettings))
      }
      
      // Load final question settings
      const savedFinalQuestions = localStorage.getItem('instructor-final-questions')
      if (savedFinalQuestions) {
        setFinalQuestionSettings(JSON.parse(savedFinalQuestions))
      }
      
      // Load feedback settings
      const savedFeedbackSettings = localStorage.getItem('instructor-feedback-settings')
      if (savedFeedbackSettings) {
        setFeedbackSettings(JSON.parse(savedFeedbackSettings))
      }
      
      // Load student progress
      const savedStudentData = localStorage.getItem('instructor-student-data')
      if (savedStudentData) {
        setStudentData(JSON.parse(savedStudentData))
        generateProgressSummary(JSON.parse(savedStudentData))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const generateProgressSummary = (data) => {
    const summaryMap = new Map()
    
    data.forEach(record => {
      const key = `${record.sessionId}_${record.name}`
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          sessionId: record.sessionId,
          name: record.name,
          semester: record.semester,
          year: record.year,
          groupNumber: record.groupNumber,
          startTime: record.timestamp,
          lastActivity: record.timestamp,
          questionsAnswered: 0,
          questionsCorrect: 0,
          incorrectAnswers: [],
          rooms: new Set(),
          completed: false
        })
      }
      
      const summary = summaryMap.get(key)
      summary.lastActivity = record.timestamp
      summary.questionsAnswered++
      if (record.isCorrect) {
        summary.questionsCorrect++
      } else {
        summary.incorrectAnswers.push({
          questionId: record.questionId,
          roomId: record.roomId,
          studentAnswer: record.answer,
          timestamp: record.timestamp,
          attemptNumber: record.attemptNumber
        })
      }
      summary.rooms.add(record.roomId)
      
      if (record.roomId === 'main-room' && record.questionId === 'final_question' && record.isCorrect) {
        summary.completed = true
      }
    })
    
    const progressArray = Array.from(summaryMap.values()).map(summary => ({
      ...summary,
      rooms: Array.from(summary.rooms),
      accuracyRate: summary.questionsAnswered > 0 ? 
        Math.round((summary.questionsCorrect / summary.questionsAnswered) * 100) : 0
    }))
    
    setStudentProgress(progressArray)
  }

  const setDefaultWordSettings = () => {
    const defaultSettings = {
      targetWord: 'EDUCATION',
      numGroups: 15,
      groupLetters: {}
    }
    assignLettersToGroups(defaultSettings, 'EDUCATION', 15)
    setWordSettings(defaultSettings)
  }

  const assignLettersToGroups = (settings, word, numGroups) => {
    if (!word || numGroups < 1) return
    
    const letters = word.toUpperCase().split('')
    const newGroupLetters = {}
    
    const expandedLetters = []
    for (let i = 0; i < numGroups; i++) {
      expandedLetters.push(letters[i % letters.length])
    }
    
    const shuffledLetters = [...expandedLetters]
    for (let i = shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]]
    }
    
    for (let i = 1; i <= numGroups; i++) {
      newGroupLetters[i] = shuffledLetters[i - 1]
    }
    
    settings.groupLetters = newGroupLetters
  }

  const updateGeneralSettings = (updates) => {
    const newSettings = { ...generalSettings, ...updates }
    setGeneralSettings(newSettings)
    localStorage.setItem('instructor-general-settings', JSON.stringify(newSettings))
  }

  const saveAllSettings = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('instructor-general-settings', JSON.stringify(generalSettings))
      localStorage.setItem('instructor-room-images', JSON.stringify(roomImages))
      localStorage.setItem('instructor-room-elements', JSON.stringify(roomElements))
      localStorage.setItem('instructor-word-settings', JSON.stringify(wordSettings))
      localStorage.setItem('instructor-game-settings', JSON.stringify(gameSettings))
      localStorage.setItem('instructor-preparation-questions', JSON.stringify(preparationSettings))
      localStorage.setItem('instructor-final-questions', JSON.stringify(finalQuestionSettings))
      localStorage.setItem('instructor-feedback-settings', JSON.stringify(feedbackSettings))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('All settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const exportConfig = () => {
    const config = {
      generalSettings,
      roomImages,
      roomElements,
      wordSettings,
      gameSettings,
      preparationSettings,
      finalQuestionSettings,
      feedbackSettings,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `escape-room-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importConfig = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result)
        
        if (config.generalSettings) setGeneralSettings(config.generalSettings)
        if (config.roomImages) setRoomImages(config.roomImages)
        if (config.roomElements) setRoomElements(config.roomElements)
        if (config.wordSettings) setWordSettings(config.wordSettings)
        if (config.gameSettings) setGameSettings(config.gameSettings)
        if (config.preparationSettings) setPreparationSettings(config.preparationSettings)
        if (config.finalQuestionSettings) setFinalQuestionSettings(config.finalQuestionSettings)
        if (config.feedbackSettings) setFeedbackSettings(config.feedbackSettings)
        
        // Save to localStorage
        localStorage.setItem('instructor-general-settings', JSON.stringify(config.generalSettings || {}))
        localStorage.setItem('instructor-room-images', JSON.stringify(config.roomImages || {}))
        localStorage.setItem('instructor-room-elements', JSON.stringify(config.roomElements || {}))
        localStorage.setItem('instructor-word-settings', JSON.stringify(config.wordSettings || {}))
        localStorage.setItem('instructor-game-settings', JSON.stringify(config.gameSettings || {}))
        localStorage.setItem('instructor-preparation-questions', JSON.stringify(config.preparationSettings || {}))
        localStorage.setItem('instructor-final-questions', JSON.stringify(config.finalQuestionSettings || {}))
        localStorage.setItem('instructor-feedback-settings', JSON.stringify(config.feedbackSettings || {}))
        
        alert('Configuration imported successfully!')
      } catch (error) {
        console.error('Error importing config:', error)
        alert('Error importing configuration. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data including settings and student progress? This action cannot be undone.')) {
      // Clear all localStorage data
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('instructor-') || key.includes('escape-room') || key.includes('student-info')) {
          localStorage.removeItem(key)
        }
      })
      
      // Reset all state
      setGeneralSettings({
        gameTitle: '',
        gameDescription: '',
        gameEmoji: '',
        subjectArea: '',
        storyTitle: '',
        storyDescription: '',
        urgencyLevel: '',
        actionButtonText: '',
        actionButtonEmoji: '',
        preparationRoomTitle: '',
        preparationRoomDescription: '',
        preparationRoomEmoji: '',
        mainRoomTitle: '',
        mainRoomDescription: '',
        mainRoomEmoji: '',
        completionTitle: '',
        completionDescription: '',
        completionEmoji: '',
        finalWordChallenge: '',
        instructorPassword: 'educator2024'
      })
      setRoomImages({})
      setRoomElements({})
      setWordSettings({ targetWord: 'EDUCATION', numGroups: 15, groupLetters: {} })
      setGameSettings({ completionMode: 'all', finalElementId: '', finalQuestion: null })
      setPreparationSettings({ groups: {} })
      setFinalQuestionSettings({ groups: {} })
      setFeedbackSettings({
        questionFeedback: {},
        generalFeedback: {
          excellent: 'Outstanding work! You demonstrate excellent understanding.',
          good: 'Good job! You show solid understanding with room for minor improvements.',
          needs_improvement: 'Consider reviewing the material and practicing more.',
          poor: 'Please review the fundamental concepts and seek additional help.'
        }
      })
      setStudentData([])
      setStudentProgress([])
      
      alert('All data has been cleared.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            🔒 Instructor Portal
          </h1>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter instructor password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🎓 Educational Escape Room - Instructor Portal
            </h1>
            <div className="flex gap-2">
              <button
                onClick={exportConfig}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold"
              >
                📤 Export Config
              </button>
              
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold cursor-pointer">
                📥 Import Config
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={saveAllSettings}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isSaving ? 'Saving...' : '💾 Save All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {['general', 'room-setup', 'group-questions', 'word-scramble', 'progress', 'advanced'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'general' && '🏠 General Settings'}
                {tab === 'room-setup' && '🏗️ Room Setup'}
                {tab === 'group-questions' && '❓ Group Questions'}
                {tab === 'word-scramble' && '🧩 Word Scramble'}
                {tab === 'progress' && '📈 Student Progress'}
                {tab === 'advanced' && '⚙️ Advanced'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🏠 General Game Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Title
                  </label>
                  <input
                    type="text"
                    value={generalSettings.gameTitle}
                    onChange={(e) => updateGeneralSettings({ gameTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chemistry Lab Investigation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Emoji
                  </label>
                  <input
                    type="text"
                    value={generalSettings.gameEmoji}
                    onChange={(e) => updateGeneralSettings({ gameEmoji: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 🧪"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Description
                  </label>
                  <textarea
                    value={generalSettings.gameDescription}
                    onChange={(e) => updateGeneralSettings({ gameDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Brief description of the educational escape room..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Area
                  </label>
                  <input
                    type="text"
                    value={generalSettings.subjectArea}
                    onChange={(e) => updateGeneralSettings({ subjectArea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chemistry, Biology, Physics"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor Password
                  </label>
                  <input
                    type="text"
                    value={generalSettings.instructorPassword}
                    onChange={(e) => updateGeneralSettings({ instructorPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password for instructor access"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Story Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storyTitle}
                    onChange={(e) => updateGeneralSettings({ storyTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., URGENT: Chemical Spill Investigation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={generalSettings.urgencyLevel}
                    onChange={(e) => updateGeneralSettings({ urgencyLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select urgency level</option>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">URGENT</option>
                    <option value="critical">CRITICAL</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Description
                  </label>
                  <textarea
                    value={generalSettings.storyDescription}
                    onChange={(e) => updateGeneralSettings({ storyDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Detailed story description to engage students..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Button Text
                  </label>
                  <input
                    type="text"
                    value={generalSettings.actionButtonText}
                    onChange={(e) => updateGeneralSettings({ actionButtonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Begin Investigation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Button Emoji
                  </label>
                  <input
                    type="text"
                    value={generalSettings.actionButtonEmoji}
                    onChange={(e) => updateGeneralSettings({ actionButtonEmoji: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 🚨"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🚪 Room Settings</h2>
              <div className="grid grid-cols-1 md:grid-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Preparation Room</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={generalSettings.preparationRoomTitle}
                        onChange={(e) => updateGeneralSettings({ preparationRoomTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Safety Equipment Room"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emoji
                      </label>
                      <input
                        type="text"
                        value={generalSettings.preparationRoomEmoji}
                        onChange={(e) => updateGeneralSettings({ preparationRoomEmoji: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 🥽"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={generalSettings.preparationRoomDescription}
                        onChange={(e) => updateGeneralSettings({ preparationRoomDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Description of the preparation room..."
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Main Room</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={generalSettings.mainRoomTitle}
                        onChange={(e) => updateGeneralSettings({ mainRoomTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Laboratory Investigation"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emoji
                      </label>
                      <input
                        type="text"
                        value={generalSettings.mainRoomEmoji}
                        onChange={(e) => updateGeneralSettings({ mainRoomEmoji: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 🔬"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={generalSettings.mainRoomDescription}
                        onChange={(e) => updateGeneralSettings({ mainRoomDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Description of the main room..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🎉 Completion Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Title
                  </label>
                  <input
                    type="text"
                    value={generalSettings.completionTitle}
                    onChange={(e) => updateGeneralSettings({ completionTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Investigation Complete!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Emoji
                  </label>
                  <input
                    type="text"
                    value={generalSettings.completionEmoji}
                    onChange={(e) => updateGeneralSettings({ completionEmoji: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 🎉"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Description
                  </label>
                  <textarea
                    value={generalSettings.completionDescription}
                    onChange={(e) => updateGeneralSettings({ completionDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Message shown when students complete the escape room..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Final Word Challenge Title
                  </label>
                  <input
                    type="text"
                    value={generalSettings.finalWordChallenge}
                    onChange={(e) => updateGeneralSettings({ finalWordChallenge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Class Word Scramble Challenge"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Setup Tab */}
        {activeTab === 'room-setup' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🏗️ Room Setup</h2>
              <p className="text-gray-600 mb-4">
                Upload room images and define interactive elements for your escape room.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-800 mb-2">How to Set Up Rooms:</h3>
                <ol className="text-blue-700 text-sm space-y-1">
                  <li>1. Select a wall (North, East, South, West)</li>
                  <li>2. Upload an image of your room/environment</li>
                  <li>3. Draw rectangles on the image to define interactive areas</li>
                  <li>4. Configure each interactive element with questions and content</li>
                  <li>5. Repeat for all walls you want to use</li>
                </ol>
              </div>
            </div>

            {/* Wall Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Select Wall to Configure</h3>
              <div className="flex space-x-4">
                {wallOptions.map(wall => (
                  <button
                    key={wall}
                    onClick={() => setSelectedWall(wall)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedWall === wall
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {wall.charAt(0).toUpperCase() + wall.slice(1)} Wall
                    {roomImages[wall] && <span className="ml-2">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Image Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Room Image - {selectedWall.charAt(0).toUpperCase() + selectedWall.slice(1)} Wall
              </h3>
              
              {roomImages[selectedWall] ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Current image: {roomImages[selectedWall].name}
                    </span>
                    <button
                      onClick={() => {
                        const newImages = { ...roomImages }
                        delete newImages[selectedWall]
                        setRoomImages(newImages)
                        localStorage.setItem('instructor-room-images', JSON.stringify(newImages))
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No image uploaded for this wall</p>
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return

                    if (!file.type.startsWith('image/')) {
                      alert('Please upload only image files')
                      return
                    }

                    if (file.size > 10 * 1024 * 1024) {
                      alert('File size must be less than 10MB')
                      return
                    }

                    const reader = new FileReader()
                    reader.onload = (e) => {
                      const newRoomImages = {
                        ...roomImages,
                        [selectedWall]: {
                          data: e.target.result,
                          name: file.name,
                          size: file.size,
                          lastModified: new Date().toISOString()
                        }
                      }
                      setRoomImages(newRoomImages)
                      localStorage.setItem('instructor-room-images', JSON.stringify(newRoomImages))
                    }
                    reader.readAsDataURL(file)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload a high-quality image of your room/environment. You'll be able to define interactive regions on this image.
                </p>
              </div>
            </div>

            {/* Interactive Elements List */}
            {Object.keys(roomElements).filter(id => roomElements[id].wall === selectedWall).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Interactive Elements - {selectedWall.charAt(0).toUpperCase() + selectedWall.slice(1)} Wall
                </h3>
                <div className="space-y-3">
                  {Object.entries(roomElements)
                    .filter(([id, element]) => element.wall === selectedWall)
                    .map(([elementId, element]) => (
                      <div key={elementId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-bold">{element.name}</h4>
                          <p className="text-sm text-gray-600">
                            {elementTypes[element.type]} | {interactionTypes[element.interactionType]}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingElement(element)
                              setSelectedElementId(elementId)
                              setShowElementModal(true)
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this element?')) {
                                const newElements = { ...roomElements }
                                delete newElements[elementId]
                                setRoomElements(newElements)
                                localStorage.setItem('instructor-room-elements', JSON.stringify(newElements))
                              }
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Group Questions Tab */}
        {activeTab === 'group-questions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">❓ Configure Questions by Group</h2>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Select Group to Configure:
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: wordSettings.numGroups}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Group {num}</option>
                  ))}
                </select>
              </div>
              <p className="text-gray-600 text-sm">
                Configure different questions for each group. Groups will only see content assigned to their specific group number.
              </p>
            </div>

            {/* Preparation Room Questions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Preparation Room Question - Group {selectedGroup}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={preparationSettings.groups?.[selectedGroup]?.[0]?.question || ''}
                    onChange={(e) => {
                      const newSettings = {
                        ...preparationSettings,
                        groups: {
                          ...preparationSettings.groups,
                          [selectedGroup]: [{
                            id: `prep_g${selectedGroup}`,
                            question: e.target.value,
                            type: 'multiple_choice',
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            answer: 'Option A',
                            hint: '',
                            clue: ''
                          }]
                        }
                      }
                      setPreparationSettings(newSettings)
                      localStorage.setItem('instructor-preparation-questions', JSON.stringify(newSettings))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter preparation room question for this group..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    value={preparationSettings.groups?.[selectedGroup]?.[0]?.answer || ''}
                    onChange={(e) => {
                      const currentQuestion = preparationSettings.groups?.[selectedGroup]?.[0] || {}
                      const newSettings = {
                        ...preparationSettings,
                        groups: {
                          ...preparationSettings.groups,
                          [selectedGroup]: [{
                            ...currentQuestion,
                            answer: e.target.value
                          }]
                        }
                      }
                      setPreparationSettings(newSettings)
                      localStorage.setItem('instructor-preparation-questions', JSON.stringify(newSettings))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the correct answer..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={preparationSettings.groups?.[selectedGroup]?.[0]?.hint || ''}
                    onChange={(e) => {
                      const currentQuestion = preparationSettings.groups?.[selectedGroup]?.[0] || {}
                      const newSettings = {
                        ...preparationSettings,
                        groups: {
                          ...preparationSettings.groups,
                          [selectedGroup]: [{
                            ...currentQuestion,
                            hint: e.target.value
                          }]
                        }
                      }
                      setPreparationSettings(newSettings)
                      localStorage.setItem('instructor-preparation-questions', JSON.stringify(newSettings))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional hint for students..."
                  />
                </div>
              </div>
            </div>

            {/* Final Question */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Final Question - Group {selectedGroup}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.question || ''}
                    onChange={(e) => {
                      const newSettings = {
                        ...finalQuestionSettings,
                        groups: {
                          ...finalQuestionSettings.groups,
                          [selectedGroup]: [{
                            id: `final_g${selectedGroup}`,
                            question: e.target.value,
                            type: 'text',
                            correctText: '',
                            hint: '',
                            info: ''
                          }]
                        }
                      }
                      setFinalQuestionSettings(newSettings)
                      localStorage.setItem('instructor-final-questions', JSON.stringify(newSettings))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter final question for this group..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    value={finalQuestionSettings.groups?.[selectedGroup]?.[0]?.correctText || ''}
                    onChange={(e) => {
                      const currentQuestion = finalQuestionSettings.groups?.[selectedGroup]?.[0] || {}
                      const newSettings = {
                        ...finalQuestionSettings,
                        groups: {
                          ...finalQuestionSettings.groups,
                          [selectedGroup]: [{
                            ...currentQuestion,
                            correctText: e.target.value
                          }]
                        }
                      }
                      setFinalQuestionSettings(newSettings)
                      localStorage.setItem('instructor-final-questions', JSON.stringify(newSettings))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
