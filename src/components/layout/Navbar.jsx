import { useState, useEffect }     from 'react'
import { Link, useNavigate }       from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, LogOut, User, Settings,
  Bell, ChevronDown, Menu,
  CheckCircle, Zap, Trophy, Flame,
  Trash2, CheckCheck, X
} from 'lucide-react'
import toast                       from 'react-hot-toast'
import useAuthStore                from '../../store/useAuthStore'
import useNotifStore               from '../../store/useNotifStore'
import ThemeToggle                 from './ThemeToggle'
import { logOut }                  from '../../services/authService'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../../services/notificationService'

const iconMap = {
  sparkles:  <Sparkles  size={14} className="text-primary-500" />,
  check:     <CheckCircle size={14} className="text-green-500"  />,
  trophy:    <Trophy    size={14} className="text-yellow-500"  />,
  zap:       <Zap       size={14} className="text-blue-500"    />,
  flame:     <Flame     size={14} className="text-orange-500"  />,
}

const typeColors = {
  course:      'bg-primary-50 dark:bg-primary-900/20',
  lesson:      'bg-green-50   dark:bg-green-900/20',
  quiz:        'bg-blue-50    dark:bg-blue-900/20',
  achievement: 'bg-yellow-50  dark:bg-yellow-900/20',
  streak:      'bg-orange-50  dark:bg-orange-900/20',
  system:      'bg-gray-50    dark:bg-gray-800',
}

const timeAgo = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp?.toDate?.() || new Date(timestamp)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const Navbar = ({ onMenuClick }) => {
  const { user }         = useAuthStore()
  const {
    notifications, unreadCount,
    setNotifications, markRead,
    markAllRead, removeNotification, clearAll,
  }                      = useNotifStore()
  const navigate         = useNavigate()

  const [dropOpen,   setDropOpen]   = useState(false)
  const [bellOpen,   setBellOpen]   = useState(false)
  const [loadingN,   setLoadingN]   = useState(false)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    setLoadingN(true)
    try {
      const data = await getNotifications(user.uid)
      setNotifications(data)
    } catch {
      // silently fail
    } finally {
      setLoadingN(false)
    }
  }

  const handleMarkRead = async (notif) => {
    if (notif.read) return
    try {
      await markAsRead(notif.id)
      markRead(notif.id)
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user.uid)
      markAllRead()
      toast.success('All marked as read')
    } catch {}
  }

  const handleDelete = async (e, notifId) => {
    e.stopPropagation()
    try {
      await deleteNotification(notifId)
      removeNotification(notifId)
    } catch {}
  }

  const handleClearAll = async () => {
    try {
      await clearAllNotifications(user.uid)
      clearAll()
      toast.success('Notifications cleared')
    } catch {}
  }

  const handleNotifClick = async (notif) => {
    await handleMarkRead(notif)
    setBellOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const handleLogout = async () => {
    try {
      await logOut()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800
                       bg-white dark:bg-gray-900 flex items-center
                       px-4 gap-4 sticky top-0 z-40">

      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100
                   dark:hover:bg-gray-800 transition-colors"
      >
        <Menu size={20} className="text-gray-600 dark:text-gray-400" />
      </button>

      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 bg-primary-600 rounded-lg
                        flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white hidden sm:block">
          CourseAI
        </span>
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-2">

        <ThemeToggle />

        {/* ── Notification Bell ── */}
        <div className="relative">
          <button
            onClick={() => {
              setBellOpen(!bellOpen)
              setDropOpen(false)
            }}
            className="relative p-2 rounded-xl hover:bg-gray-100
                       dark:hover:bg-gray-800 transition-colors"
          >
            <Bell size={18} className="text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5
                           bg-red-500 text-white text-xs font-bold
                           rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          {/* Notification Panel */}
          <AnimatePresence>
            {bellOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setBellOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8,  scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: 8,  scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 z-50
                             card shadow-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between
                                  px-4 py-3 border-b border-gray-100
                                  dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900
                                     dark:text-white text-sm">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-red-100 dark:bg-red-900/30
                                         text-red-600 text-xs font-bold
                                         px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary-600 hover:text-primary-700
                                     font-medium flex items-center gap-1"
                        >
                          <CheckCheck size={12} />
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="text-xs text-gray-400 hover:text-red-500
                                     transition-colors"
                          title="Clear all"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-96 overflow-y-auto">
                    {loadingN ? (
                      <div className="space-y-3 p-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700
                                            rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700
                                              rounded w-3/4" />
                              <div className="h-2 bg-gray-100 dark:bg-gray-800
                                              rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell size={28} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                          No notifications yet
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          Complete lessons to get updates
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0   }}
                          onClick={() => handleNotifClick(notif)}
                          className={`flex gap-3 px-4 py-3 cursor-pointer
                                     border-b border-gray-50 dark:border-gray-800/50
                                     last:border-0 hover:bg-gray-50
                                     dark:hover:bg-gray-800/50 transition-colors
                                     relative group
                                     ${!notif.read
                                       ? 'bg-primary-50/50 dark:bg-primary-900/10'
                                       : ''
                                     }`}
                        >
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-xl flex items-center
                                          justify-center shrink-0 mt-0.5
                                          ${typeColors[notif.type] || typeColors.system}`}>
                            {iconMap[notif.icon] || iconMap.sparkles}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold leading-snug
                                          ${!notif.read
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-600 dark:text-gray-400'
                                          }`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5
                                          leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-300
                                          dark:text-gray-600 mt-1">
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {!notif.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full
                                            shrink-0 mt-1.5" />
                          )}

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDelete(e, notif.id)}
                            className="absolute top-2 right-2 p-1 rounded-lg
                                       opacity-0 group-hover:opacity-100
                                       hover:bg-gray-200 dark:hover:bg-gray-700
                                       transition-all duration-200"
                          >
                            <X size={11} className="text-gray-400" />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100
                                    dark:border-gray-800 text-center">
                      <p className="text-xs text-gray-400">
                        {notifications.length} notification
                        {notifications.length !== 1 ? 's' : ''} total
                      </p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setDropOpen(!dropOpen)
              setBellOpen(false)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              style={{ display: user?.photoURL ? 'none' : 'flex' }}
              className="w-7 h-7 rounded-full bg-primary-600
                         items-center justify-center"
            >
              <span className="text-white text-xs font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                 user?.email?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700
                             dark:text-gray-300 hidden sm:block
                             max-w-[100px] truncate">
              {user?.displayName?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {dropOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8,  scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: 8,  scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 z-50
                             card shadow-lg py-1 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100
                                  dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900
                                  dark:text-white truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5
                                 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-800
                                 transition-colors"
                    >
                      <User size={15} className="text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5
                                 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-800
                                 transition-colors"
                    >
                      <Settings size={15} className="text-gray-400" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 w-full
                                 text-sm text-red-500 hover:bg-red-50
                                 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default Navbar