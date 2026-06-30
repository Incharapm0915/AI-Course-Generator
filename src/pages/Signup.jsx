import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { signUpWithEmail, loginWithGoogle, loginWithGitHub } from '../services/authService'

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

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    displayName: '',
    email:       '',
    password:    '',
    confirm:     '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [loading, setLoading]           = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const { displayName, email, password, confirm } = formData

    if (!displayName || !email || !password || !confirm) {
      toast.error('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await signUpWithEmail(email, password, displayName)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use')
        toast.error('Email already in use')
      else if (err.code === 'auth/invalid-email')
        toast.error('Invalid email address')
      else
        toast.error('Signup failed. Try again.')
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

  // Password strength checker
  const getPasswordStrength = (pass) => {
    if (!pass) return null
    if (pass.length < 6)  return { label: 'Too short', color: 'bg-red-400',    width: 'w-1/4' }
    if (pass.length < 8)  return { label: 'Weak',      color: 'bg-orange-400', width: 'w-2/4' }
    if (pass.length < 12) return { label: 'Good',      color: 'bg-yellow-400', width: 'w-3/4' }
    return                       { label: 'Strong',    color: 'bg-green-500',  width: 'w-full' }
  }

  const strength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] 
                    flex items-center justify-center p-4">
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
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Start learning with AI today
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
            <span className="text-xs text-gray-400">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 
                                           -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 
                                           -translate-y-1/2 text-gray-400" />
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
                <Lock size={16} className="absolute left-3 top-1/2 
                                           -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600
                             dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className={`h-1 rounded-full transition-all duration-300
                                    ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 
                                           -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  value={formData.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`input-field pl-9 pr-10 ${
                    formData.confirm && formData.confirm !== formData.password
                      ? 'border-red-400 focus:ring-red-400'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600
                             dark:hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.confirm && formData.confirm !== formData.password && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup