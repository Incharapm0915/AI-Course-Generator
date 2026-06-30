import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import MyCourses  from './pages/MyCourses'
import ProfilePage      from './pages/ProfilePage'
import AchievementsPage from './pages/AchievementsPage'

import useAuthStore      from './store/useAuthStore'
import useThemeStore     from './store/useThemeStore'
import ProtectedRoute    from './components/layout/ProtectedRoute'
import DashboardLayout   from './components/layout/DashboardLayout'
import FlashcardsPage from './pages/FlashcardsPage'

import LandingPage     from './pages/LandingPage'
import Dashboard       from './pages/Dashboard'
import Login           from './pages/Login'
import Signup          from './pages/Signup'
import NotFound        from './pages/NotFound'
import GenerateCourse from './pages/GenerateCourse'
import CourseView from './pages/CourseView'
import QuizPage from './pages/QuizPage'
import QuizzesPage from './pages/QuizzesPage'
import ChatTutorPage from './pages/ChatTutorPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BookmarksPage from './pages/BookmarksPage'
import SettingsPage  from './pages/SettingsPage'

function App() {
  const { setUser, setLoading } = useAuthStore()
  const { initTheme }           = useThemeStore()

  useEffect(() => {
    initTheme()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 3000,
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<Login />}       />
        <Route path="/signup" element={<Signup />}      />

        {/* Protected routes — all inside DashboardLayout */}
<Route element={
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
}>
  <Route path="/dashboard"    element={<Dashboard />}      />
<Route path="/generate"     element={<GenerateCourse />} />
<Route path="/my-courses"   element={<MyCourses />}      />
<Route path="/course/:id"   element={<CourseView />}     />
<Route path="/bookmarks"    element={<BookmarksPage/>}      />
<Route path="/quizzes" element={<QuizzesPage />} />
<Route path="/analytics"    element={<AnalyticsPage />}      />
<Route path="/achievements" element={<AchievementsPage />}      />
<Route path="/chat"         element={<ChatTutorPage />}      />
<Route path="/profile"      element={<ProfilePage />}      />
<Route path="/flashcards" element={<FlashcardsPage />} />

<Route path="/settings"     element={<SettingsPage />} />
<Route path="/quiz/:id" element={<QuizPage />} />
</Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App