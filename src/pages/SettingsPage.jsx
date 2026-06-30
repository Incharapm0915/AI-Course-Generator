import { useState }    from 'react'
import { motion }      from 'framer-motion'
import {
  Bell, Shield, Trash2, LogOut,
  ChevronRight, Palette, Loader2
} from 'lucide-react'
import toast           from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { deleteUser }  from 'firebase/auth'
import { auth }        from '../lib/firebase'
import useAuthStore    from '../store/useAuthStore'
import useThemeStore   from '../store/useThemeStore'
import { logOut }      from '../services/authService'
import ThemeToggle     from '../components/layout/ThemeToggle'

const SettingsPage = () => {
  const { user }           = useAuthStore()
  const { isDark }         = useThemeStore()
  const navigate           = useNavigate()

  const [notifications, setNotifications] = useState({
    email:  true,
    streak: true,
    quiz:   false,
    weekly: true,
  })
  const [deleting,   setDeleting]   = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logOut()
      toast.success('Logged out')
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    } finally {
      setLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure? This will permanently delete your account and all courses.'
    )
    if (!confirmed) return
    setDeleting(true)
    try {
      await deleteUser(auth.currentUser)
      toast.success('Account deleted')
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in first, then try again.')
      } else {
        toast.error('Failed to delete account')
      }
    } finally {
      setDeleting(false)
    }
  }

  const sections = [
    {
      title: 'Appearance',
      icon:  <Palette size={18} className="text-primary-600" />,
      content: (
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Dark Mode
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Currently {isDark ? 'dark' : 'light'} mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon:  <Bell size={18} className="text-yellow-500" />,
      content: (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {[
            { key: 'email',  label: 'Email notifications', desc: 'Receive updates via email'           },
            { key: 'streak', label: 'Streak reminders',     desc: 'Daily reminder to keep your streak' },
            { key: 'quiz',   label: 'Quiz results',         desc: 'Get notified about quiz scores'     },
            { key: 'weekly', label: 'Weekly summary',       desc: 'Weekly learning progress report'    },
          ].map((item) => (
            <div key={item.key}
              className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({
                  ...prev,
                  [item.key]: !prev[item.key],
                }))}
                className={`relative w-11 h-6 rounded-full transition-colors
                           duration-200 ${notifications[item.key]
                             ? 'bg-primary-600'
                             : 'bg-gray-200 dark:bg-gray-700'
                           }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5
                               bg-white rounded-full shadow transition-transform
                               duration-200 ${notifications[item.key]
                                 ? 'translate-x-5'
                                 : 'translate-x-0'
                               }`}
                />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Account',
      icon:  <Shield size={18} className="text-green-500" />,
      content: (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">

          {/* Email */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Email Address
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            </div>
            <span className="text-xs bg-green-50 dark:bg-green-900/20
                             text-green-600 px-2 py-1 rounded-lg font-medium">
              Verified
            </span>
          </div>

          {/* Edit Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center justify-between p-4
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Edit Profile
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Update your name and avatar
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 p-4
                       hover:bg-gray-50 dark:hover:bg-gray-800
                       transition-colors text-left"
          >
            {loggingOut
              ? <Loader2 size={16} className="text-gray-400 animate-spin" />
              : <LogOut  size={16} className="text-gray-400"              />
            }
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sign Out
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Sign out of your account
              </p>
            </div>
          </button>
        </div>
      ),
    },
    {
      title: 'Danger Zone',
      icon:  <Trash2 size={18} className="text-red-500" />,
      content: (
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Delete Account
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Permanently delete your account and all data.
                This cannot be undone.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="shrink-0 flex items-center gap-2 px-4 py-2
                         rounded-xl text-sm font-medium text-red-600
                         border-2 border-red-200 dark:border-red-800
                         hover:bg-red-50 dark:hover:bg-red-900/20
                         transition-colors disabled:opacity-50"
            >
              {deleting
                ? <Loader2 size={14} className="animate-spin" />
                : <Trash2  size={14} />
              }
              Delete
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your preferences and account
        </p>
      </div>

      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="card overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3
                          border-b border-gray-100 dark:border-gray-800
                          bg-gray-50 dark:bg-gray-800/50">
            {section.icon}
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
              {section.title}
            </h2>
          </div>
          {section.content}
        </motion.div>
      ))}
    </div>
  )
}

export default SettingsPage