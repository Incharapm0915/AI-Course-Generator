import { useState, useEffect }     from 'react'
import { useNavigate }             from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw, ChevronLeft, ChevronRight,
  Sparkles, BookOpen, Loader2,
  ArrowLeft, Lightbulb, Check, X
} from 'lucide-react'
import toast                       from 'react-hot-toast'
import { getUserCourses }          from '../services/courseService'
import { callGeminiFlashcards }    from '../services/aiService'
import useAuthStore                from '../store/useAuthStore'

const FlashcardsPage = () => {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()

  const [courses,        setCourses]        = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [flashcards,     setFlashcards]     = useState([])
  const [current,        setCurrent]        = useState(0)
  const [flipped,        setFlipped]        = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [showHint,       setShowHint]       = useState(false)
  const [results,        setResults]        = useState([])
  const [phase,          setPhase]          = useState('select-course')
  // phases: select-course → select-module → loading → cards → results

  useEffect(() => { fetchCourses() }, [])

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

  const handleSelectModule = async (mod) => {
    setSelectedModule(mod)
    setPhase('loading')
    setLoading(true)
    try {
      const lessonTitles = mod.lessons.map((l) => l.title)
      const cards = await callGeminiFlashcards({
        moduleTitle: mod.title,
        lessons:     lessonTitles,
      })
      setFlashcards(cards)
      setCurrent(0)
      setFlipped(false)
      setResults([])
      setShowHint(false)
      setPhase('cards')
    } catch {
      toast.error('Failed to generate flashcards. Try again.')
      setPhase('select-module')
    } finally {
      setLoading(false)
    }
  }

  const handleFlip = () => {
    setFlipped((f) => !f)
    setShowHint(false)
  }

  const handleResult = (knew) => {
    setResults((prev) => [...prev, { ...flashcards[current], knew }])

    if (current < flashcards.length - 1) {
      setFlipped(false)
      setShowHint(false)
      setTimeout(() => setCurrent((c) => c + 1), 200)
    } else {
      setPhase('results')
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setFlipped(false)
    setResults([])
    setShowHint(false)
    setPhase('cards')
  }

  const knewCount = results.filter((r) => r.knew).length

  // ── Select course ──────────────────────────────────
  if (phase === 'select-course') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Flashcards
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Select a course to generate AI flashcards
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
            <BookOpen size={28} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              No courses yet
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Generate a course first to unlock flashcards
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
                onClick={() => {
                  setSelectedCourse(course)
                  setPhase('select-module')
                }}
                className="w-full card p-5 text-left flex items-center gap-4
                           hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white 
                                 text-sm truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {course.level} · {course.modules?.length} modules
                  </p>
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

  // ── Select module ──────────────────────────────────
  if (phase === 'select-module') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setPhase('select-course')}
            className="p-2 rounded-xl hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Select Module
            </h1>
            <p className="text-sm text-gray-400">{selectedCourse?.title}</p>
          </div>
        </div>

        <div className="space-y-3">
          {selectedCourse?.modules?.map((mod, i) => (
            <motion.button
              key={mod.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => handleSelectModule(mod)}
              className="w-full card p-5 text-left flex items-center gap-4
                         hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 
                              rounded-xl flex items-center justify-center 
                              text-lg font-bold text-primary-600 shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {mod.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {mod.lessons?.length} lessons · 8 flashcards
                </p>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-300 group-hover:text-primary-500 
                           transition-colors shrink-0"
              />
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 
                          rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 size={28} className="text-primary-600 animate-spin" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Generating Flashcards...
          </h3>
          <p className="text-sm text-gray-400">
            AI is creating cards for {selectedModule?.title}
          </p>
        </div>
      </div>
    )
  }

  // ── Cards ──────────────────────────────────────────
  if (phase === 'cards' && flashcards.length > 0) {
    const card = flashcards[current]

    return (
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setPhase('select-module')}
            className="p-2 rounded-xl hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {current + 1} / {flashcards.length}
            </p>
          </div>
          <div className="text-sm font-semibold text-green-500">
            {results.filter((r) => r.knew).length} ✓
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
          <motion.div
            animate={{ width: `${((current) / flashcards.length) * 100}%` }}
            className="h-full bg-primary-600 rounded-full"
          />
        </div>

        {/* Card */}
        <div
          onClick={handleFlip}
          className="cursor-pointer mb-6"
          style={{ perspective: '1000px' }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ transformStyle: 'preserve-3d', position: 'relative' }}
            className="relative h-64"
          >
            {/* Front */}
            <div
              className="absolute inset-0 card p-8 flex flex-col 
                         items-center justify-center text-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 
                              rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-primary-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 
                            uppercase tracking-wider mb-3">
                Question
              </p>
              <p className="text-base font-semibold text-gray-900 
                            dark:text-white leading-relaxed">
                {card.front}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Tap to reveal answer
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 card p-8 flex flex-col 
                         items-center justify-center text-center
                         bg-primary-50 dark:bg-primary-900/20 
                         border-primary-200 dark:border-primary-800"
              style={{
                backfaceVisibility: 'hidden',
                transform:          'rotateY(180deg)',
              }}
            >
              <p className="text-xs font-semibold text-primary-500 
                            uppercase tracking-wider mb-3">
                Answer
              </p>
              <p className="text-base text-gray-900 dark:text-white 
                            leading-relaxed">
                {card.back}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Hint */}
        {!flipped && card.hint && (
          <div className="text-center mb-4">
            {showHint ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-amber-600 dark:text-amber-400 
                           bg-amber-50 dark:bg-amber-900/20 px-4 py-2 
                           rounded-xl inline-block"
              >
                💡 {card.hint}
              </motion.p>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-gray-400 hover:text-amber-500 
                           transition-colors flex items-center gap-1 mx-auto"
              >
                <Lightbulb size={13} />
                Show hint
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              className="flex gap-3"
            >
              <button
                onClick={() => handleResult(false)}
                className="flex-1 flex items-center justify-center gap-2 
                           py-3 rounded-xl border-2 border-red-200 
                           dark:border-red-800 bg-red-50 dark:bg-red-900/20 
                           text-red-600 font-medium text-sm 
                           hover:bg-red-100 transition-colors"
              >
                <X size={18} />
                Still learning
              </button>
              <button
                onClick={() => handleResult(true)}
                className="flex-1 flex items-center justify-center gap-2 
                           py-3 rounded-xl border-2 border-green-200 
                           dark:border-green-800 bg-green-50 dark:bg-green-900/20 
                           text-green-600 font-medium text-sm 
                           hover:bg-green-100 transition-colors"
              >
                <Check size={18} />
                Got it!
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => {
              if (current > 0) {
                setCurrent((c) => c - 1)
                setFlipped(false)
                setShowHint(false)
              }
            }}
            disabled={current === 0}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 
                       transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleFlip}
            className="flex items-center gap-2 text-sm text-gray-400 
                       hover:text-primary-600 transition-colors"
          >
            <RotateCcw size={14} />
            Flip card
          </button>

          <button
            onClick={() => {
              if (current < flashcards.length - 1) {
                setCurrent((c) => c + 1)
                setFlipped(false)
                setShowHint(false)
              }
            }}
            disabled={current === flashcards.length - 1}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 
                       transition-colors disabled:opacity-30"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────
  if (phase === 'results') {
    const pct = Math.round((knewCount / flashcards.length) * 100)

    return (
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          className="text-center"
        >
          <div className="card p-8 mb-4">
            <div className="text-5xl mb-3">
              {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {pct}% Mastered
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {knewCount} of {flashcards.length} cards known
            </p>

            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{knewCount}</div>
                <div className="text-xs text-gray-400 mt-0.5">Known</div>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {flashcards.length - knewCount}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Review</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="btn-secondary flex-1 py-2.5 flex items-center 
                           justify-center gap-2 text-sm"
              >
                <RotateCcw size={15} />
                Restart
              </button>
              <button
                onClick={() => setPhase('select-module')}
                className="btn-primary flex-1 py-2.5 flex items-center 
                           justify-center gap-2 text-sm"
              >
                <BookOpen size={15} />
                New Module
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }
}

export default FlashcardsPage