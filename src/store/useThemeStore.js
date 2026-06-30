import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark
        if (newIsDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { isDark: newIsDark }
      }),
      initTheme: () => set((state) => {
        if (state.isDark) {
          document.documentElement.classList.add('dark')
        }
        return state
      }),
    }),
    { name: 'theme-storage' }
  )
)

export default useThemeStore