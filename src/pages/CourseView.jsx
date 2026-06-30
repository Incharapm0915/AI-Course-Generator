import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { exportCoursePDF } from '../services/exportService'
import YouTubeVideos from '../components/course/YouTubeVideos'
import { Download }        from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, ChevronDown, ChevronUp,
  CheckCircle, Circle, Clock, Target,
  ArrowLeft, Bookmark, BookmarkCheck,
  Sparkles, Trophy, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getCourse,
  toggleLessonComplete,
  toggleBookmark,
  saveLessonNote,
} from '../services/courseService'
import { notify } from '../services/notificationService'
import useAuthStore from '../store/useAuthStore'

const CourseView = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuthStore()

  const [course,          setCourse]          = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [activeLesson,    setActiveLesson]    = useState(null)
  const [expandedModules, setExpandedModules] = useState({})
  const [note,            setNote]            = useState('')
  const [savingNote,      setSavingNote]      = useState(false)
  const [showNotes,       setShowNotes]       = useState(false)

  useEffect(() => {
    fetchCourse()
  }, [id])

  useEffect(() => {
    if (activeLesson) {
      const saved = course?.notes?.[activeLesson.id] || ''
      setNote(saved)
    }
  }, [activeLesson])

  const fetchCourse = async () => {
    try {
      const data = await getCourse(id)
      setCourse(data)
      // Auto expand first module
      if (data.modules?.length > 0) {
        setExpandedModules({ [data.modules[0].id]: true })
        setActiveLesson(data.modules[0].lessons[0])
      }
    } catch (err) {
      toast.error('Course not found')
      navigate('/my-courses')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLesson = async (lessonId) => {
    const isCompleted = course.completedLessons?.includes(lessonId)
    try {
      const result = await toggleLessonComplete(id, lessonId, !isCompleted)
      setCourse((prev) => ({
        ...prev,
        completedLessons: result.completedLessons,
        progress:         result.progress,
      }))

      if (!isCompleted) {
        toast.success('Lesson completed! 🎉')

        const lesson = course.modules
          ?.flatMap((m) => m.lessons)
          ?.find((l) => l.id === lessonId)

        await notify.lessonCompleted(user.uid, lesson?.title || 'Lesson')

        if (result.progress === 100) {
          await notify.courseCompleted(user.uid, course.title)
        }
      }
    } catch {
      toast.error('Failed to update progress')
    }
  }

  const handleToggleBookmark = async () => {
    try {
      const newVal = !course.bookmarked
      await toggleBookmark(id, newVal)
      setCourse((prev) => ({ ...prev, bookmarked: newVal }))
      toast.success(newVal ? 'Bookmarked!' : 'Bookmark removed')
    } catch {
      toast.error('Failed to update bookmark')
    }
  }

  const handleSaveNote = async () => {
    if (!activeLesson) return
    setSavingNote(true)
    try {
      await saveLessonNote(id, activeLesson.id, note)
      setCourse((prev) => ({
        ...prev,
        notes: { ...prev.notes, [activeLesson.id]: note },
      }))
      toast.success('Note saved!')
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSavingNote(false)
    }
  }

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const totalLessons = course?.modules?.reduce(
    (acc, mod) => acc + mod.lessons.length, 0
  ) || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl 
                          flex items-center justify-center animate-pulse">
            <Sparkles size={20} className="text-white" />
          </div>
          <p className="text-sm text-gray-400">Loading course...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/my-courses')}
            className="p-2 rounded-xl hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors mt-1"
          >
            <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {course?.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {course?.duration}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Target size={12} />
                {course?.level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleBookmark}
            className="p-2 rounded-xl hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
          >
            {course?.bookmarked
              ? <BookmarkCheck size={18} className="text-primary-600" />
              : <Bookmark      size={18} className="text-gray-400"    />
            }
          </button>
          <button
            onClick={() => navigate(`/quiz/${id}`)}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-2"
          >
            <Trophy size={14} />
            Take Quiz
          </button>
          <button
            onClick={() => exportCoursePDF(course)}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-2"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-primary-600">
            {course?.progress || 0}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${course?.progress || 0}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-primary-600 rounded-full"
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>
            {course?.completedLessons?.length || 0} of {totalLessons} lessons completed
          </span>
          {course?.progress === 100 && (
            <span className="flex items-center gap-1 text-green-500 font-medium">
              <Trophy size={12} />
              Course Complete!
            </span>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sidebar — modules & lessons */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 
                         dark:text-gray-400 uppercase tracking-wider mb-3">
            Course Content
          </h2>

          {course?.modules?.map((mod, modIdx) => (
            <div key={mod.id} className="card overflow-hidden">

              {/* Module header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between 
                           p-4 text-left hover:bg-gray-50 
                           dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 
                                  rounded-lg flex items-center justify-center 
                                  text-xs font-bold text-primary-600 shrink-0">
                    {modIdx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 
                                  dark:text-white leading-tight">
                      {mod.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {mod.lessons?.length} lessons
                    </p>
                  </div>
                </div>
                {expandedModules[mod.id]
                  ? <ChevronUp   size={16} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={16} className="text-gray-400 shrink-0" />
                }
              </button>

              {/* Lessons */}
              <AnimatePresence>
                {expandedModules[mod.id] && (
                  <motion.div
                    initial={{ height: 0,   opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{    height: 0,   opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      {mod.lessons?.map((lesson) => {
                        const isCompleted = course?.completedLessons?.includes(lesson.id)
                        const isActive    = activeLesson?.id === lesson.id

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer
                                       border-b border-gray-50 dark:border-gray-800/50
                                       last:border-0 transition-colors
                                       ${isActive
                                         ? 'bg-primary-50 dark:bg-primary-900/20'
                                         : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                       }`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleLesson(lesson.id)
                              }}
                              className="shrink-0"
                            >
                              {isCompleted
                                ? <CheckCircle size={16} className="text-green-500" />
                                : <Circle      size={16} className="text-gray-300 dark:text-gray-600" />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate
                                           ${isActive
                                             ? 'text-primary-700 dark:text-primary-300'
                                             : 'text-gray-700 dark:text-gray-300'
                                           } ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {lesson.duration}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Main content — active lesson */}
        <div className="lg:col-span-2 space-y-4">
          {activeLesson ? (
            <>
              {/* Lesson header */}
              <div className="card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 
                                   dark:text-white mb-1">
                      {activeLesson.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activeLesson.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleLesson(activeLesson.id)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 
                               rounded-xl text-xs font-medium transition-all
                               ${course?.completedLessons?.includes(activeLesson.id)
                                 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-800'
                                 : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                               }`}
                  >
                    {course?.completedLessons?.includes(activeLesson.id)
                      ? <><CheckCircle size={12} /> Completed</>
                      : <><Circle      size={12} /> Mark Complete</>
                    }
                  </button>
                </div>

                {/* Lesson content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 
                                leading-relaxed whitespace-pre-line text-sm">
                    {activeLesson.content}
                  </p>
                </div>
              </div>

              {/* YouTube Videos */}
              <YouTubeVideos
                lessonTitle={activeLesson.title}
                topic={course?.topic || course?.title}
              />

              {/* Key points */}
              {activeLesson.keyPoints?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 
                                 flex items-center gap-2">
                    <Sparkles size={16} className="text-primary-600" />
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {activeLesson.keyPoints.map((point, i) => (
                      <li key={i}
                        className="flex items-start gap-3 text-sm 
                                   text-gray-700 dark:text-gray-300">
                        <CheckCircle
                          size={16}
                          className="text-primary-600 mt-0.5 shrink-0"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              {activeLesson.resources?.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Resources
                  </h3>
                  <div className="space-y-2">
                    {activeLesson.resources.map((res, i) => (
                      
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl
                                   bg-gray-50 dark:bg-gray-800 
                                   hover:bg-gray-100 dark:hover:bg-gray-700
                                   transition-colors group"
                      >
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 
                                        rounded-lg flex items-center justify-center">
                          <BookOpen size={14} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 
                                        dark:text-white group-hover:text-primary-600 
                                        transition-colors">
                            {res.title}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {res.type}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="card p-6">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white 
                                 flex items-center gap-2">
                    <FileText size={16} className="text-primary-600" />
                    My Notes
                  </h3>
                  {showNotes
                    ? <ChevronUp   size={16} className="text-gray-400" />
                    : <ChevronDown size={16} className="text-gray-400" />
                  }
                </button>

                <AnimatePresence>
                  {showNotes && (
                    <motion.div
                      initial={{ height: 0,   opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{    height: 0,   opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Write your notes for this lesson..."
                          className="input-field resize-none h-32 text-sm mb-3"
                        />
                        <button
                          onClick={handleSaveNote}
                          disabled={savingNote}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          {savingNote ? 'Saving...' : 'Save Note'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center">
              <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Select a lesson to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseView