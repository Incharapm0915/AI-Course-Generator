import { Sun, Moon } from 'lucide-react'
import useThemeStore from '../../store/useThemeStore'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 
                 hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-all duration-200 active:scale-95"
      aria-label="Toggle theme"
    >
      {isDark
        ? <Sun  size={18} className="text-yellow-400" />
        : <Moon size={18} className="text-gray-600"   />
      }
    </button>
  )
}

export default ThemeToggle