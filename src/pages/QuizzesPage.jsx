import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, BookOpen, ChevronRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUserCourses } from '../services/courseService'
import useAuthStore from '../store/useAuthStore'

const QuizzesPage = () => {
  const { user }              = useAuthStore()
  const navigate              = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    try {
      const data = await getUserCourses(user.uid)
      setCourses(data)
    } catch {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quizzes
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Select a course to take a module quiz
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 
                          rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            No courses yet
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Generate a course first to unlock quizzes
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course, i) => (
            <motion.button
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => navigate(`/quiz/${course.id}`)}
              className="card p-5 text-left flex items-center gap-4
                         hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 
                              rounded-xl flex items-center justify-center shrink-0">
                <Trophy size={20} className="text-primary-600" />
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
                {/* Progress */}
                <div className="mt-2">
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
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

export default QuizzesPage