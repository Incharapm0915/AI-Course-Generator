import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginWithEmail, loginWithGoogle, loginWithGitHub } from '../services/authService'

const SocialButton = ({ onClick, disabled, label, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex-1 flex items-center justify-center gap-2
               border border-gray-200 dark:border-gray-700
               rounded-xl py-2.5 px-4
               hover:bg-gray-50 dark:hover:bg-gray-800
               transition-all duration-200 active:scale-95
               text-gray-700 dark:text-gray-300 font-medium text-sm
               disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {icon}
    {label}
  </button>
)

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData]     = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await loginWithEmail(formData.email, formData.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      if (err.code === 'auth/user-not-found')   toast.error('No account found with this email')
      else if (err.code === 'auth/wrong-password') toast.error('Incorrect password')
      else if (err.code === 'auth/invalid-credential') toast.error('Invalid email or password')
      else toast.error('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSocial = async (provider, name) => {
    setSocialLoading(name)
    try {
      if (provider === 'google') await loginWithGoogle()
      else await loginWithGitHub()
      toast.success('Welcome!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(`${name} sign-in failed. Try again.`)
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 
                          bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Sign in to continue learning
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">

          {/* Social buttons */}
          <div className="flex gap-2 mb-6">

            {/* Google */}
            <SocialButton
              onClick={() => handleSocial('google', 'Google')}
              disabled={!!socialLoading}
              label={socialLoading === 'Google' ? '...' : 'Google'}
              icon={
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              }
            />

            {/* GitHub */}
            <SocialButton
              onClick={() => handleSocial('github', 'GitHub')}
              disabled={!!socialLoading}
              label={socialLoading === 'GitHub' ? '...' : 'GitHub'}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              }
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 
                                dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 
                                           text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 
                                dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 
                                           text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-gray-400 hover:text-gray-600 
                             dark:hover:text-gray-300"
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye    size={16} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup"
            className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login