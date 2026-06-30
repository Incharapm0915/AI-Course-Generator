import { useState, useEffect, useRef } from 'react'
import { useNavigate }                  from 'react-router-dom'
import { motion, AnimatePresence }      from 'framer-motion'
import {
  Send, Mic, MicOff, Sparkles,
  BookOpen, ChevronRight, Bot,
  User, Loader2, ArrowLeft
} from 'lucide-react'
import toast                from 'react-hot-toast'
import { getUserCourses }   from '../services/courseService'
import { chatWithTutor }    from '../services/aiService'
import useAuthStore         from '../store/useAuthStore'

const ChatTutorPage = () => {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  const [courses,        setCourses]        = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [messages,       setMessages]       = useState([])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [listening,      setListening]      = useState(false)
  const [phase,          setPhase]          = useState('select')
  // phases: select → chat

  useEffect(() => { fetchCourses() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchCourses = async () => {
    try {
      const data = await getUserCourses(user.uid)
      setCourses(data)
    } catch {
      toast.error('Failed to load courses')
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleSelectCourse = (course) => {
    setSelectedCourse(course)
    setMessages([
      {
        role:    'assistant',
        content: `Hi! I'm your AI tutor for **${course.title}**. I'm here to help you understand the course material, answer questions, and guide you through any concepts you find challenging. What would you like to know? 🎓`,
      },
    ])
    setPhase('chat')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)
    setLoading(true)

    try {
      const history = newMessages.slice(-10).map((m) => ({
        role:    m.role,
        content: m.content,
      }))

      const reply = await chatWithTutor({
        courseTitle:       selectedCourse.title,
        courseDescription: selectedCourse.description,
        userMessage,
        history: history.slice(0, -1),
      })

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply },
      ])
    } catch (err) {
      toast.error('Failed to get response. Try again.')
      setMessages((prev) => prev.slice(0, -1))
      setInput(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Voice input
  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser')
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang           = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend   = () => setListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => prev + transcript)
      inputRef.current?.focus()
    }

    recognition.onerror = () => {
      setListening(false)
      toast.error('Voice input failed. Try again.')
    }

    if (listening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/\n/g,            '<br/>')
  }

  const suggestedQuestions = [
    'Can you explain the key concepts?',
    'What should I focus on first?',
    'Give me a quick summary',
    'What are common mistakes to avoid?',
  ]

  // Phase: Select course
  if (phase === 'select') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Tutor
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Select a course to chat with your personal AI tutor
          </p>
        </div>

        {loadingCourses ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"      />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 
                            rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              No courses yet
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Generate a course first to unlock the AI tutor
            </p>
            <button
              onClick={() => navigate('/generate')}
              className="btn-primary px-6 py-2.5 inline-flex items-center gap-2 text-sm"
            >
              <Sparkles size={15} />
              Generate a Course
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, i) => (
              <motion.button
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => handleSelectCourse(course)}
                className="w-full card p-5 text-left flex items-center gap-4
                           hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center shrink-0">
                  <Bot size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white 
                                 text-sm truncate">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} />
                      {course.modules?.length} modules
                    </span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 group-hover:text-primary-500 
                             transition-colors shrink-0"
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Phase: Chat
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">

      {/* Chat header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button
          onClick={() => setPhase('select')}
          className="p-2 rounded-xl hover:bg-gray-100 
                     dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-9 h-9 bg-primary-600 rounded-xl 
                        flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            AI Tutor
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">
            {selectedCourse?.title}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center 
                            shrink-0 mt-0.5
                            ${msg.role === 'assistant'
                              ? 'bg-primary-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
              {msg.role === 'assistant'
                ? <Sparkles size={14} className="text-white"                          />
                : <User     size={14} className="text-gray-600 dark:text-gray-300"    />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                            ${msg.role === 'assistant'
                              ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-sm'
                              : 'bg-primary-600 text-white rounded-tr-sm'
                            }`}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
          </motion.div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-primary-600 
                            flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 
                            dark:border-gray-800 px-4 py-3 rounded-2xl 
                            rounded-tl-sm flex items-center gap-2">
              <Loader2 size={14} className="text-primary-600 animate-spin" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions — show only at start */}
      {messages.length === 1 && (
        <div className="flex gap-2 flex-wrap mb-3 shrink-0">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs px-3 py-1.5 rounded-full border 
                         border-gray-200 dark:border-gray-700
                         text-gray-600 dark:text-gray-400
                         hover:border-primary-300 dark:hover:border-primary-700
                         hover:text-primary-600 transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0">
        <div className="card p-3 flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about the course..."
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none
                       text-sm text-gray-900 dark:text-white 
                       placeholder-gray-400 max-h-32"
            style={{ lineHeight: '1.5' }}
          />

          {/* Voice button */}
          <button
            onClick={handleVoice}
            className={`p-2 rounded-xl transition-all duration-200 shrink-0
                       ${listening
                         ? 'bg-red-100 dark:bg-red-900/30 text-red-500 animate-pulse'
                         : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
                       }`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-primary-600 hover:bg-primary-700 
                       text-white transition-all duration-200 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatTutorPage