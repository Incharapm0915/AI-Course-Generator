import { useState, useEffect } from 'react'
import { motion }              from 'framer-motion'
import {
  Trophy, Flame, BookOpen, Zap,
  Star, Target, Lock, CheckCircle
} from 'lucide-react'
import toast                   from 'react-hot-toast'
import useAuthStore            from '../store/useAuthStore'
import { getUserStats }        from '../services/authService'
import { getUserCourses }      from '../services/courseService'

const allBadges = [
  {
    id:    'first-course',
    title: 'First Steps',
    desc:  'Generate your first course',
    icon:  <BookOpen size={24} />,
    color: 'text-blue-500',
    bg:    'bg-blue-50 dark:bg-blue-900/20',
    check: ({ courses }) => courses.length >= 1,
  },
  {
    id:    'five-courses',
    title: 'Course Collector',
    desc:  'Generate 5 courses',
    icon:  <BookOpen size={24} />,
    color: 'text-blue-600',
    bg:    'bg-blue-50 dark:bg-blue-900/20',
    check: ({ courses }) => courses.length >= 5,
  },
  {
    id:    'first-lesson',
    title: 'Getting Started',
    desc:  'Complete your first lesson',
    icon:  <CheckCircle size={24} />,
    color: 'text-green-500',
    bg:    'bg-green-50 dark:bg-green-900/20',
    check: ({ totalLessons }) => totalLessons >= 1,
  },
  {
    id:    'ten-lessons',
    title: 'Dedicated Learner',
    desc:  'Complete 10 lessons',
    icon:  <Zap size={24} />,
    color: 'text-yellow-500',
    bg:    'bg-yellow-50 dark:bg-yellow-900/20',
    check: ({ totalLessons }) => totalLessons >= 10,
  },
  {
    id:    'streak-3',
    title: 'On Fire',
    desc:  'Maintain a 3-day streak',
    icon:  <Flame size={24} />,
    color: 'text-orange-500',
    bg:    'bg-orange-50 dark:bg-orange-900/20',
    check: ({ streak }) => streak >= 3,
  },
  {
    id:    'streak-7',
    title: 'Week Warrior',
    desc:  'Maintain a 7-day streak',
    icon:  <Flame size={24} />,
    color: 'text-red-500',
    bg:    'bg-red-50 dark:bg-red-900/20',
    check: ({ streak }) => streak >= 7,
  },
  {
    id:    'complete-course',
    title: 'Course Master',
    desc:  'Complete an entire course',
    icon:  <Trophy size={24} />,
    color: 'text-purple-500',
    bg:    'bg-purple-50 dark:bg-purple-900/20',
    check: ({ completedCourses }) => completedCourses >= 1,
  },
  {
    id:    'xp-100',
    title: 'XP Hunter',
    desc:  'Earn 100 XP points',
    icon:  <Star size={24} />,
    color: 'text-pink-500',
    bg:    'bg-pink-50 dark:bg-pink-900/20',
    check: ({ xp }) => xp >= 100,
  },
  {
    id:    'xp-500',
    title: 'XP Champion',
    desc:  'Earn 500 XP points',
    icon:  <Star size={24} />,
    color: 'text-pink-600',
    bg:    'bg-pink-50 dark:bg-pink-900/20',
    check: ({ xp }) => xp >= 500,
  },
  {
    id:    'three-levels',
    title: 'Explorer',
    desc:  'Try all 3 difficulty levels',
    icon:  <Target size={24} />,
    color: 'text-teal-500',
    bg:    'bg-teal-50 dark:bg-teal-900/20',
    check: ({ courses }) => {
      const levels = new Set(courses.map((c) => c.level))
      return levels.has('beginner') &&
             levels.has('intermediate') &&
             levels.has('advanced')
    },
  },
  {
    id:    'bookmarked',
    title: 'Bookworm',
    desc:  'Bookmark a course',
    icon:  <BookOpen size={24} />,
    color: 'text-indigo-500',
    bg:    'bg-indigo-50 dark:bg-indigo-900/20',
    check: ({ courses }) => courses.some((c) => c.bookmarked),
  },
  {
    id:    'fifty-lessons',
    title: 'Learning Machine',
    desc:  'Complete 50 lessons',
    icon:  <Zap size={24} />,
    color: 'text-yellow-600',
    bg:    'bg-yellow-50 dark:bg-yellow-900/20',
    check: ({ totalLessons }) => totalLessons >= 50,
  },
]

const AchievementsPage = () => {
  const { user }              = useAuthStore()
  const [stats,   setStats]   = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [statsData, coursesData] = await Promise.all([
        getUserStats(user.uid),
        getUserCourses(user.uid),
      ])
      setStats(statsData)
      setCourses(coursesData)
    } catch {
      toast.error('Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }

  const totalLessons     = courses.reduce(
    (acc, c) => acc + (c.completedLessons?.length || 0), 0)
  const completedCourses = courses.filter((c) => c.progress === 100).length

  const context = {
    courses,
    totalLessons,
    completedCourses,
    streak: stats?.streak || 0,
    xp:     stats?.xp     || 0,
  }

  const earned   = allBadges.filter((b) => b.check(context))
  const locked   = allBadges.filter((b) => !b.check(context))
  const progress = Math.round((earned.length / allBadges.length) * 100)

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 
                            rounded-2xl mx-auto mb-3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Achievements
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Earn badges by learning and hitting milestones
        </p>
      </div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Overall Progress
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {earned.length} of {allBadges.length} badges earned
            </p>
          </div>
          <div className="text-3xl font-bold text-primary-600">
            {progress}%
          </div>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary-500 
                       to-primary-600 rounded-full"
          />
        </div>
      </motion.div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 
                         dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            Earned ({earned.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1   }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card p-5 text-center hover:shadow-md 
                           transition-shadow relative overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute top-0 right-0 w-8 h-8 
                                bg-yellow-400/20 rounded-bl-2xl" />

                <div className={`w-14 h-14 ${badge.bg} rounded-2xl 
                                flex items-center justify-center mx-auto mb-3`}>
                  <span className={badge.color}>{badge.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white 
                               text-sm mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {badge.desc}
                </p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <CheckCircle size={13} className="text-green-500" />
                  <span className="text-xs text-green-500 font-medium">
                    Earned
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 
                         dark:text-white mb-4 flex items-center gap-2">
            <Lock size={18} className="text-gray-400" />
            Locked ({locked.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {locked.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1   }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="card p-5 text-center opacity-60"
              >
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 
                                rounded-2xl flex items-center justify-center 
                                mx-auto mb-3">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-500 dark:text-gray-400 
                               text-sm mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {badge.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AchievementsPage