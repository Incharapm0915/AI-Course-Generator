import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion }              from 'framer-motion'
import {
  BookmarkCheck, BookOpen, Clock,
  Target, ChevronRight, Sparkles
} from 'lucide-react'
import toast                   from 'react-hot-toast'
import { getUserCourses }      from '../services/courseService'
import useAuthStore            from '../store/useAuthStore'

const BookmarksPage = () => {
  const { user }                = useAuthStore()
  const navigate                = useNavigate()
  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { fetchCourses() }, [])

  const fetchCourses = async () => {
    try {
      const data      = await getUserCourses(user.uid)
      const bookmarked = data.filter((c) => c.bookmarked)
      setCourses(bookmarked)
    } catch {
      toast.error('Failed to load bookmarks')
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
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2"       />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3"      />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bookmarks
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {courses.length} bookmarked course{courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 
                          rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck size={28} className="text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            No bookmarks yet
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Open any course and click the bookmark icon to save it here
          </p>
          <button
            onClick={() => navigate('/my-courses')}
            className="btn-primary px-6 py-2.5 inline-flex 
                       items-center gap-2 text-sm"
          >
            <BookOpen size={15} />
            Browse My Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => navigate(`/course/${course.id}`)}
              className="card p-5 cursor-pointer hover:shadow-md 
                         transition-all duration-200 group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center">
                  <BookOpen size={18} className="text-primary-600" />
                </div>
                <BookmarkCheck size={16} className="text-primary-600 mt-1" />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 dark:text-white 
                             text-sm mb-1 line-clamp-2 leading-snug">
                {course.title}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                {course.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Clock  size={11} /> {course.duration}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <Target size={11} /> {course.level}
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium text-primary-600">
                    {course.progress || 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all"
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Continue */}
              <div className="flex items-center justify-end mt-3">
                <span className="text-xs text-primary-600 font-medium 
                                 flex items-center gap-1 opacity-0 
                                 group-hover:opacity-100 transition-opacity">
                  Continue
                  <ChevronRight size={13} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookmarksPage