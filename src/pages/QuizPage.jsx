import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, CheckCircle, XCircle, ArrowLeft,
  Sparkles, ChevronRight, RotateCcw, Loader2,
  BookOpen, Target
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getCourse, saveQuizResult } from '../services/courseService'
import { generateQuiz }              from '../services/aiService'
import { notify }                    from '../services/notificationService'
import useAuthStore                  from '../store/useAuthStore'

const QuizPage = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuthStore()

  const [course,          setCourse]          = useState(null)
  const [selectedModule,  setSelectedModule]  = useState(null)
  const [questions,       setQuestions]       = useState([])
  const [currentQ,        setCurrentQ]        = useState(0)
  const [selectedAnswer,  setSelectedAnswer]  = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score,           setScore]           = useState(0)
  const [finished,        setFinished]        = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [answers,         setAnswers]         = useState([])
  const [phase,           setPhase]           = useState('select')
  // phases: select → loading → quiz → results

  useEffect(() => { fetchCourse() }, [id])

  const fetchCourse = async () => {
    try {
      const data = await getCourse(id)
      setCourse(data)
    } catch {
      toast.error('Course not found')
      navigate('/my-courses')
    }
  }

  const handleStartQuiz = async (mod) => {
    setSelectedModule(mod)
    setPhase('loading')
    setLoading(true)
    try {
      const lessonTitles = mod.lessons.map((l) => l.title)
      const quiz = await generateQuiz({
        moduleTitle:       mod.title,
        moduleDescription: mod.description,
        lessonTitles,
      })
      setQuestions(quiz.questions)
      setCurrentQ(0)
      setScore(0)
      setAnswers([])
      setSelectedAnswer(null)
      setShowExplanation(false)
      setFinished(false)
      setPhase('quiz')
    } catch (err) {
      toast.error('Failed to generate quiz. Try again.')
      setPhase('select')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (idx) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    setShowExplanation(true)

    const isCorrect = idx === questions[currentQ].correctIndex
    if (isCorrect) setScore((s) => s + 1)

    setAnswers((prev) => [...prev, {
      question:  questions[currentQ].question,
      selected:  idx,
      correct:   questions[currentQ].correctIndex,
      isCorrect,
    }])
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      handleFinish()
    }
  }

  const handleFinish = async () => {
    setPhase('results')
    const pct = Math.round((score / questions.length) * 100)
    const result = {
      moduleId:    selectedModule.id,
      moduleTitle: selectedModule.title,
      score,
      total:       questions.length,
      percentage:  pct,
      answers,
    }
    try {
      await saveQuizResult(user.uid, id, selectedModule.id, result)

      if (pct >= 60) {
        await notify.quizPassed(user.uid, pct, selectedModule.title)
      } else {
        await notify.quizFailed(user.uid, pct, selectedModule.title)
      }
    } catch {
      // silently fail
    }
  }

  const handleRetry = () => {
    handleStartQuiz(selectedModule)
  }

  const getScoreColor = (pct) => {
    if (pct >= 80) return 'text-green-500'
    if (pct >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBg = (pct) => {
    if (pct >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    if (pct >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  const getScoreMessage = (pct) => {
    if (pct === 100) return '🏆 Perfect score! Outstanding!'
    if (pct >= 80)   return '🎉 Excellent work! Keep it up!'
    if (pct >= 60)   return '👍 Good job! Review the missed ones.'
    return '📚 Keep studying! You\'ll get there.'
  }

  const percentage = questions.length > 0
    ? Math.round((score / questions.length) * 100)
    : 0

  // Phase: Select module
  if (phase === 'select') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/course/${id}`)}
            className="p-2 rounded-xl hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Module Quizzes
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {course?.title}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {course?.modules?.map((mod, i) => (
            <motion.button
              key={mod.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => handleStartQuiz(mod)}
              className="w-full card p-5 text-left flex items-center gap-4
                         hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 
                              rounded-xl flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary-600">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {mod.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {mod.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    {mod.lessons?.length} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Target size={11} />
                    5 questions
                  </span>
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
      </div>
    )
  }

  // Phase: Loading quiz
  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 
                          rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 size={28} className="text-primary-600 animate-spin" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Generating Quiz...
          </h3>
          <p className="text-sm text-gray-400">
            AI is creating questions for {selectedModule?.title}
          </p>
        </div>
      </div>
    )
  }

  // Phase: Quiz
  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[currentQ]

    return (
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setPhase('select')}
            className="p-2 rounded-xl hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Question {currentQ + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-primary-600">
            <Trophy size={15} />
            {score}/{currentQ + (selectedAnswer !== null ? 1 : 0)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
          <motion.div
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-primary-600 rounded-full"
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20  }}
            animate={{ opacity: 1, x: 0   }}
            exit={{    opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card p-6 mb-4">
              <h2 className="text-base font-semibold text-gray-900 
                             dark:text-white leading-relaxed">
                {q.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-4">
              {q.options.map((option, idx) => {
                const isSelected  = selectedAnswer === idx
                const isCorrect   = idx === q.correctIndex
                const showResult  = selectedAnswer !== null

                let style = 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'

                if (showResult) {
                  if (isCorrect) {
                    style = 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  } else if (isSelected && !isCorrect) {
                    style = 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  }
                } else if (isSelected) {
                  style = 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl 
                               border-2 text-left transition-all duration-200
                               disabled:cursor-default ${style}`}
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center 
                                    justify-center text-xs font-bold shrink-0
                                    ${showResult && isCorrect
                                      ? 'border-green-500 bg-green-500 text-white'
                                      : showResult && isSelected && !isCorrect
                                        ? 'border-red-500 bg-red-500 text-white'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-500'
                                    }`}>
                      {showResult && isCorrect
                        ? <CheckCircle size={14} />
                        : showResult && isSelected && !isCorrect
                          ? <XCircle size={14} />
                          : String.fromCharCode(65 + idx)
                      }
                    </div>
                    <span className={`text-sm font-medium
                                    ${showResult && isCorrect
                                      ? 'text-green-700 dark:text-green-300'
                                      : showResult && isSelected && !isCorrect
                                        ? 'text-red-700 dark:text-red-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                      {option}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8  }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: 8  }}
                  transition={{ duration: 0.2 }}
                  className={`card p-4 mb-4 border-2
                             ${selectedAnswer === q.correctIndex
                               ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                               : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                             }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedAnswer === q.correctIndex
                      ? <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                      : <XCircle     size={16} className="text-red-500 mt-0.5 shrink-0"   />
                    }
                    <div>
                      <p className={`text-xs font-semibold mb-1
                                    ${selectedAnswer === q.correctIndex
                                      ? 'text-green-700 dark:text-green-300'
                                      : 'text-red-700 dark:text-red-300'
                                    }`}>
                        {selectedAnswer === q.correctIndex ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {selectedAnswer !== null && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="btn-primary w-full py-3 flex items-center 
                           justify-center gap-2"
              >
                {currentQ < questions.length - 1 ? (
                  <>Next Question <ChevronRight size={16} /></>
                ) : (
                  <>See Results <Trophy size={16} /></>
                )}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Phase: Results
  if (phase === 'results') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
        >
          {/* Score card */}
          <div className={`card p-8 text-center mb-6 border-2 ${getScoreBg(percentage)}`}>
            <div className="text-5xl font-bold mb-2">
              <span className={getScoreColor(percentage)}>{percentage}%</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {getScoreMessage(percentage)}
            </p>
            <p className="text-sm text-gray-400">
              {score} out of {questions.length} correct
            </p>

            {/* Score breakdown */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{score}</div>
                <div className="text-xs text-gray-400 mt-0.5">Correct</div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {questions.length - score}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Incorrect</div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {questions.length}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Total</div>
              </div>
            </div>
          </div>

          {/* Answer review */}
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Answer Review
            </h3>
            <div className="space-y-3">
              {answers.map((ans, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl
                             ${ans.isCorrect
                               ? 'bg-green-50 dark:bg-green-900/20'
                               : 'bg-red-50 dark:bg-red-900/20'
                             }`}
                >
                  {ans.isCorrect
                    ? <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                    : <XCircle     size={16} className="text-red-500 mt-0.5 shrink-0"   />
                  }
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Q{i + 1}: {ans.question}
                    </p>
                    {!ans.isCorrect && (
                      <p className="text-xs text-gray-400 mt-1">
                        Correct: {questions[i]?.options[ans.correct]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="btn-secondary flex-1 py-3 flex items-center 
                         justify-center gap-2"
            >
              <RotateCcw size={16} />
              Retry Quiz
            </button>
            <button
              onClick={() => navigate(`/course/${id}`)}
              className="btn-primary flex-1 py-3 flex items-center 
                         justify-center gap-2"
            >
              <BookOpen size={16} />
              Back to Course
            </button>
          </div>
        </motion.div>
      </div>
    )
  }
}

export default QuizPage