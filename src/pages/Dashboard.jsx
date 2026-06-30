import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { motion }              from 'framer-motion'
import {
  Sparkles, BookOpen, Trophy,
  Zap, TrendingUp, ChevronRight, Flame
} from 'lucide-react'
import toast                   from 'react-hot-toast'
import useAuthStore            from '../store/useAuthStore'
import { getUserCourses }      from '../services/courseService'
import { getUserStats }        from '../services/authService'

const quickActions = [
  {
    title: 'Generate a Course',
    desc:  'Create a new AI-powered course',
    icon:  <Sparkles size={22} className="text-primary-600" />,
    bg:    'bg-primary-50 dark:bg-primary-900/30',
    to:    '/generate',
  },
  {
    title: 'My Courses',
    desc:  'Continue where you left off',
    icon:  <BookOpen size={22} className="text-green-600" />,
    bg:    'bg-green-50 dark:bg-green-900/30',
    to:    '/my-courses',
  },
  {
    title: 'Take a Quiz',
    desc:  'Test your knowledge and earn XP',
    icon:  <Zap size={22} className="text-yellow-600" />,
    bg:    'bg-yellow-50 dark:bg-yellow-900/30',
    to:    '/quizzes',
  },
  {
    title: 'AI Tutor',
    desc:  'Chat with your personal AI tutor',
    icon:  <Trophy size={22} className="text-pink-600" />,
    bg:    'bg-pink-50 dark:bg-pink-900/30',
    to:    '/chat',
  },
]

const Dashboard = () => {
  const { user }                  = useAuthStore()
  const navigate                  = useNavigate()
  const [courses,  setCourses]    = useState([])
  const [stats,    setStats]      = useState(null)
  const [loading,  setLoading]    = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [coursesData, statsData] = await Promise.all([
        getUserCourses(user.uid),
        getUserStats(user.uid),
      ])
      setCourses(coursesData)
      setStats(statsData)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const totalLessons     = courses.reduce(
    (acc, c) => acc + (c.completedLessons?.length || 0), 0)
  const recentCourses    = courses.slice(0, 3)

  const statCards = [
    {
      label: 'Courses Generated',
      value:  courses.length,
      icon:  <BookOpen   size={20} />,
      color: 'text-blue-500',
      bg:    'bg-blue-50   dark:bg-blue-900/20',
    },
    {
      label: 'Lessons Completed',
      value:  totalLessons,
      icon:  <Zap        size={20} />,
      color: 'text-green-500',
      bg:    'bg-green-50  dark:bg-green-900/20',
    },
    {
      label: 'Day Streak',
      value:  stats?.streak || 0,
      icon:  <Flame      size={20} />,
      color: 'text-orange-500',
      bg:    'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'XP Points',
      value:  stats?.xp || 0,
      icon:  <TrendingUp size={20} />,
      color: 'text-purple-500',
      bg:    'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden card p-8
                   bg-gradient-to-r from-primary-600 to-primary-700 border-0"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -right-20 w-56 h-56 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'} 👋
            </h1>
            {stats?.streak > 0 && (
              <div className="flex items-center gap-1 bg-white/20
                              px-2 py-0.5 rounded-full">
                <Flame size={14} className="text-orange-300" />
                <span className="text-xs text-white font-medium">
                  {stats.streak} day streak!
                </span>
              </div>
            )}
          </div>
          <p className="text-primary-200 text-sm mb-6">
            Ready to generate your next course? Let's keep learning!
          </p>
          <button
            onClick={() => navigate('/generate')}
            className="inline-flex items-center gap-2 bg-white
                       text-primary-700 font-semibold px-6 py-2.5
                       rounded-xl hover:bg-primary-50
                       transition-all duration-200 active:scale-95 text-sm"
          >
            <Sparkles size={16} />
            Generate a Course
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl
                            flex items-center justify-center mb-3`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? (
                <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700
                                rounded animate-pulse" />
              ) : stat.value}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold text-gray-900
                       dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.to)}
              className="card p-5 text-left flex items-center gap-4
                         hover:shadow-md transition-all duration-200
                         active:scale-[0.99] group"
            >
              <div className={`w-12 h-12 ${action.bg} rounded-xl
                              flex items-center justify-center shrink-0`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {action.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-300 dark:text-gray-600
                           group-hover:text-primary-500
                           transition-colors shrink-0"
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent courses */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Courses
          </h2>
          <button
            onClick={() => navigate('/my-courses')}
            className="text-sm text-primary-600 hover:text-primary-700
                       font-medium flex items-center gap-1"
          >
            View all <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2"       />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3"      />
              </div>
            ))}
          </div>
        ) : recentCourses.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800
                            rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              No courses yet
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              Generate your first AI course to get started
            </p>
            <button
              onClick={() => navigate('/generate')}
              className="btn-primary px-6 py-2.5 inline-flex
                         items-center gap-2 text-sm"
            >
              <Sparkles size={15} />
              Generate a Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => navigate(`/course/${course.id}`)}
                className="card p-5 cursor-pointer hover:shadow-md
                           transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30
                                rounded-xl flex items-center justify-center mb-3">
                  <BookOpen size={18} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white
                               text-sm mb-1 line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-400 mb-3 capitalize">
                  {course.level} · {course.duration}
                </p>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-medium text-primary-600">
                      {course.progress || 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard