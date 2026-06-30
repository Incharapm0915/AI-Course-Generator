import { useState, useEffect } from 'react'
import { motion }              from 'framer-motion'
import {
  User, Mail, Calendar, BookOpen,
  Trophy, Flame, Star, Camera,
  Save, Loader2, Zap
} from 'lucide-react'
import toast                   from 'react-hot-toast'
import { updateProfile }       from 'firebase/auth'
import { doc, updateDoc }      from 'firebase/firestore'
import { auth, db }            from '../lib/firebase'
import useAuthStore            from '../store/useAuthStore'
import { getUserStats }        from '../services/authService'
import { getUserCourses }      from '../services/courseService'

const ProfilePage = () => {
  const { user, setUser }             = useAuthStore()
  const [stats,    setStats]          = useState(null)
  const [courses,  setCourses]        = useState([])
  const [loading,  setLoading]        = useState(true)
  const [saving,   setSaving]         = useState(false)
  const [editName, setEditName]       = useState('')
  const [isEditing, setIsEditing]     = useState(false)

  useEffect(() => {
    fetchData()
    setEditName(user?.displayName || '')
  }, [])

  const fetchData = async () => {
    try {
      const [statsData, coursesData] = await Promise.all([
        getUserStats(user.uid),
        getUserCourses(user.uid),
      ])
      setStats(statsData)
      setCourses(coursesData)
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: editName })
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editName,
      })
      setUser({ ...user, displayName: editName })
      toast.success('Name updated!')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const totalLessons    = courses.reduce(
    (acc, c) => acc + (c.completedLessons?.length || 0), 0)
  const completedCourses = courses.filter((c) => c.progress === 100).length
  const avgProgress      = courses.length > 0
    ? Math.round(courses.reduce((a, c) => a + (c.progress || 0), 0) / courses.length)
    : 0

  const profileStats = [
    { label: 'Courses',        value: courses.length,   icon: <BookOpen size={18} />, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20'     },
    { label: 'Lessons Done',   value: totalLessons,     icon: <Zap      size={18} />, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20'   },
    { label: 'Completed',      value: completedCourses, icon: <Trophy   size={18} />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Day Streak',     value: stats?.streak || 0, icon: <Flame  size={18} />, color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20'       },
    { label: 'XP Points',      value: stats?.xp || 0,   icon: <Star     size={18} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Avg Progress',   value: `${avgProgress}%`, icon: <Trophy  size={18} />, color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20'     },
  ]

  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
      })
    : 'N/A'

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="card p-8 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your account and view your learning stats
        </p>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4 }}
        className="card p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

          {/* Avatar */}
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              style={{ display: user?.photoURL ? 'none' : 'flex' }}
              className="w-20 h-20 rounded-2xl bg-primary-600
                         items-center justify-center"
            >
              <span className="text-white text-3xl font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                 user?.email?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 
                            bg-green-500 rounded-full border-2 
                            border-white dark:border-gray-900" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field text-lg font-bold max-w-xs"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="btn-primary px-3 py-2 text-sm 
                             flex items-center gap-1"
                >
                  {saving
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Save    size={14} />
                  }
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditName(user?.displayName || '')
                  }}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.displayName || 'User'}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primary-600 hover:text-primary-700 
                             font-medium"
                >
                  Edit
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm 
                            text-gray-400">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined {joinDate}
              </span>
            </div>

            {/* Level badge */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5 bg-primary-50 
                              dark:bg-primary-900/30 text-primary-700 
                              dark:text-primary-300 px-3 py-1 rounded-full 
                              text-xs font-semibold">
                <Star size={12} />
                Level {Math.floor((stats?.xp || 0) / 100) + 1} Learner
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 
                              dark:bg-orange-900/20 text-orange-600 
                              px-3 py-1 rounded-full text-xs font-semibold">
                <Flame size={12} />
                {stats?.streak || 0} day streak
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              XP Progress to Level {Math.floor((stats?.xp || 0) / 100) + 2}
            </span>
            <span className="text-sm font-bold text-primary-600">
              {(stats?.xp || 0) % 100}/100 XP
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats?.xp || 0) % 100}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-primary-500 
                         to-primary-600 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Learning Stats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {profileStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card p-4"
            >
              <div className={`w-9 h-9 ${stat.bg} rounded-xl 
                              flex items-center justify-center mb-3`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent courses */}
      {courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            My Courses
          </h2>
          <div className="card overflow-hidden">
            {courses.slice(0, 5).map((course, i) => (
              <div
                key={course.id}
                className={`flex items-center gap-4 p-4
                           ${i < courses.length - 1
                             ? 'border-b border-gray-100 dark:border-gray-800'
                             : ''
                           }`}
              >
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 
                                rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 
                                dark:text-white truncate">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 
                                    dark:bg-gray-800 rounded-full">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {course.progress || 0}%
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium
                                 capitalize shrink-0
                                 ${course.progress === 100
                                   ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                   : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                 }`}>
                  {course.progress === 100 ? 'Done' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ProfilePage