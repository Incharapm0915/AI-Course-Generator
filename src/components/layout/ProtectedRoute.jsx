import { Navigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] 
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl 
                          flex items-center justify-center animate-pulse">
            <Sparkles size={24} className="text-white" />
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute