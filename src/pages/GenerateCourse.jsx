import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, BookOpen, Clock, Target,
  ChevronRight, Loader2, CheckCircle,
  Brain, Zap, Trophy
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateCourse } from '../services/aiService'
import { saveCourse }     from '../services/courseService'
import { notify }         from '../services/notificationService'
import useAuthStore       from '../store/useAuthStore'
import { useNavigate }    from 'react-router-dom'

const levels = [
  {
    value: 'beginner',
    label: 'Beginner',
    desc:  'No prior knowledge needed',
    icon:  <BookOpen size={20} />,
    color: 'text-green-600',
    bg:    'bg-green-50 dark:bg-green-900/20',
    border:'border-green-200 dark:border-green-800',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    desc:  'Some experience required',
    icon:  <Brain size={20} />,
    color: 'text-blue-600',
    bg:    'bg-blue-50 dark:bg-blue-900/20',
    border:'border-blue-200 dark:border-blue-800',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    desc:  'Deep expertise expected',
    icon:  <Trophy size={20} />,
    color: 'text-purple-600',
    bg:    'bg-purple-50 dark:bg-purple-900/20',
    border:'border-purple-200 dark:border-purple-800',
  },
]

const durations = ['1', '2', '3', '4', '6', '8']

const suggestions = [
  'Machine Learning',
  'Web Development',
  'Data Science',
  'Python Programming',
  'Digital Marketing',
  'UI/UX Design',
  'Blockchain',
  'Cloud Computing',
]

const steps = ['Topic', 'Level', 'Duration', 'Goal']

const GenerateCourse = () => {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading]         = useState(false)
  const [generated, setGenerated]     = useState(false)

  const [formData, setFormData] = useState({
    topic:    '',
    level:    '',
    duration: '4',
    goal:     '',
  })

  const canNext = () => {
    if (currentStep === 0) return formData.topic.trim().length > 2
    if (currentStep === 1) return formData.level !== ''
    if (currentStep === 2) return formData.duration !== ''
    if (currentStep === 3) return formData.goal.trim().length > 5
    return false
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleGenerate()
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      toast.loading('Generating your course...', { id: 'gen' })
      const course = await generateCourse(formData)

      // Save to Firestore
      const courseId = await saveCourse(user.uid, {
        ...course,
        topic:     formData.topic,
        createdAt: new Date(),
        progress:  0,
        completed: false,
      })

      toast.success('Course generated!', { id: 'gen' })
      setGenerated(true)
      await notify.courseGenerated(user.uid, course.title)

      // Navigate to course view
      setTimeout(() => navigate(`/course/${courseId}`), 1000)

    } catch (err) {
      toast.error(err.message || 'Generation failed. Try again.', { id: 'gen' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Generate a Course
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Tell us what you want to learn — AI will build a full course for you
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 
                            rounded-full text-sm font-semibold 
                            transition-all duration-300
                            ${i < currentStep
                              ? 'bg-primary-600 text-white'
                              : i === currentStep
                                ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                            }`}>
              {i < currentStep
                ? <CheckCircle size={16} />
                : i + 1
              }
            </div>
            <span className={`text-sm font-medium hidden sm:block
                             ${i === currentStep
                               ? 'text-gray-900 dark:text-white'
                               : 'text-gray-400'
                             }`}>
              {step}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px w-8 mx-1 transition-all duration-300
                              ${i < currentStep
                                ? 'bg-primary-600'
                                : 'bg-gray-200 dark:bg-gray-700'
                              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="card p-8">
        <AnimatePresence mode="wait">

          {/* Step 0 — Topic */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20  }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    What do you want to learn?
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Enter any topic or skill
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && canNext() && handleNext()}
                placeholder="e.g. Machine Learning, Web Development..."
                className="input-field text-base mb-4"
                autoFocus
              />

              {/* Suggestions */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Popular topics:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFormData({ ...formData, topic: s })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                 border transition-all duration-200
                                 ${formData.topic === s
                                   ? 'bg-primary-600 text-white border-primary-600'
                                   : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-700'
                                 }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1 — Level */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20  }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    What's your skill level?
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    For: <span className="text-primary-600 font-medium">
                      {formData.topic}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {levels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, level: level.value })}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl 
                               border-2 transition-all duration-200 text-left
                               ${formData.level === level.value
                                 ? `${level.border} ${level.bg}`
                                 : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                               }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center 
                                    justify-center ${level.bg}`}>
                      <span className={level.color}>{level.icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {level.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {level.desc}
                      </p>
                    </div>
                    {formData.level === level.value && (
                      <CheckCircle
                        size={18}
                        className={`ml-auto ${level.color}`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Duration */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20  }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    How long do you want to study?
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Choose your course duration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFormData({ ...formData, duration: d })}
                    className={`p-4 rounded-xl border-2 transition-all duration-200
                               text-center
                               ${formData.duration === d
                                 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                 : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                               }`}
                  >
                    <div className={`text-2xl font-bold mb-0.5
                                    ${formData.duration === d
                                      ? 'text-primary-600'
                                      : 'text-gray-900 dark:text-white'
                                    }`}>
                      {d}
                    </div>
                    <div className="text-xs text-gray-400">
                      {d === '1' ? 'week' : 'weeks'}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3 — Goal */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20  }}
              animate={{ opacity: 1, x: 0   }}
              exit={{    opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center">
                  <Target size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    What's your learning goal?
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Be specific — AI will tailor the course to your goal
                  </p>
                </div>
              </div>

              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g. I want to build my first machine learning model and understand the core algorithms..."
                className="input-field text-sm resize-none h-32 mb-4"
                autoFocus
              />

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 
                              dark:text-gray-400 uppercase tracking-wider mb-3">
                  Course Summary
                </p>
                {[
                  { label: 'Topic',    value: formData.topic                              },
                  { label: 'Level',    value: formData.level                              },
                  { label: 'Duration', value: `${formData.duration} weeks`                },
                ].map((item) => (
                  <div key={item.label}
                    className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn-secondary px-5 py-2.5 text-sm 
                       disabled:opacity-0 disabled:pointer-events-none"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canNext() || loading}
            className="btn-primary px-6 py-2.5 text-sm 
                       flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : generated ? (
              <>
                <CheckCircle size={16} />
                Done!
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Sparkles size={16} />
                Generate Course
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GenerateCourse