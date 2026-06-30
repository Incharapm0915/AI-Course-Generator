import { NavLink }         from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Sparkles, BookOpen,
  Trophy, BarChart2, MessageSquare,
  Bookmark, Settings, X, User, Zap
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

const navItems = [
  {
    section: 'Main',
    links: [
      { to: '/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard'      },
      { to: '/generate',     icon: <Sparkles        size={18} />, label: 'Generate Course' },
      { to: '/my-courses',   icon: <BookOpen        size={18} />, label: 'My Courses'     },
      { to: '/bookmarks',    icon: <Bookmark        size={18} />, label: 'Bookmarks'      },
    ],
  },
  {
    section: 'Progress',
    links: [
      { to: '/quizzes',      icon: <Zap             size={18} />, label: 'Quizzes'        },
      { to: '/analytics',    icon: <BarChart2       size={18} />, label: 'Analytics'      },
      { to: '/achievements', icon: <Trophy          size={18} />, label: 'Achievements'   },
    ],
  },
  {
    section: 'Tools',
    links: [
      { to: '/chat',         icon: <MessageSquare   size={18} />, label: 'AI Tutor'       },
      { to: '/flashcards',   icon: <Zap             size={18} />, label: 'Flashcards'     },
      { to: '/profile',      icon: <User            size={18} />, label: 'Profile'        },
      { to: '/settings',     icon: <Settings        size={18} />, label: 'Settings'       },
    ],
  },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Logo area */}
      <div className="h-16 flex items-center justify-between px-5
                      border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg
                          flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            CourseAI
          </span>
        </div>

        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100
                     dark:hover:bg-gray-800 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.section}>

            {/* Section label */}
            <p className="text-xs font-semibold text-gray-400
                          uppercase tracking-wider px-3 mb-2">
              {section.section}
            </p>

            {/* Links */}
            <div className="space-y-0.5">
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl
                     text-sm font-medium transition-all duration-200
                     ${isActive
                       ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                       : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                     }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl
                        bg-gray-50 dark:bg-gray-800">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover shrink-0"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            style={{ display: user?.photoURL ? 'none' : 'flex' }}
            className="w-8 h-8 rounded-full bg-primary-600 shrink-0
                       items-center justify-center"
          >
            <span className="text-white text-sm font-bold">
              {user?.displayName?.charAt(0)?.toUpperCase() ||
               user?.email?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900
                          dark:text-white truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0
                        border-r border-gray-200 dark:border-gray-800
                        bg-white dark:bg-gray-900 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0    }}
              exit={{    x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden
                         bg-white dark:bg-gray-900
                         border-r border-gray-200 dark:border-gray-800"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar