import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles, BookOpen, Brain, Trophy,
  Clock, ChevronRight, Star, Zap,
  Target, BarChart2
} from 'lucide-react'
import ThemeToggle from '../components/layout/ThemeToggle'

const features = [
  {
    icon: <Brain size={22} className="text-primary-600" />,
    title: 'AI Course Generation',
    desc:  'Generate full structured courses with modules, lessons and resources in seconds.',
  },
  {
    icon: <Zap size={22} className="text-yellow-500" />,
    title: 'Smart Quizzes',
    desc:  'Auto-generated MCQ quizzes per module with explanations and score tracking.',
  },
  {
    icon: <BookOpen size={22} className="text-green-500" />,
    title: 'AI Chat Tutor',
    desc:  'Context-aware chatbot for every course to answer your doubts instantly.',
  },
  {
    icon: <Trophy size={22} className="text-orange-500" />,
    title: 'Gamification',
    desc:  'Earn XP, badges and maintain streaks to stay motivated every day.',
  },
  {
    icon: <Target size={22} className="text-pink-500" />,
    title: 'Progress Tracking',
    desc:  'Track completion across modules and lessons with visual progress bars.',
  },
  {
    icon: <BarChart2 size={22} className="text-blue-500" />,
    title: 'Performance Analytics',
    desc:  'Detailed charts showing your quiz scores and learning trends over time.',
  },
]

const steps = [
  { step: '01', title: 'Enter your topic',    desc: 'Type any subject, skill level and your learning goal.' },
  { step: '02', title: 'AI builds the course', desc: 'Claude AI generates a full syllabus with modules and lessons.' },
  { step: '03', title: 'Learn & track',        desc: 'Study, take quizzes, chat with your AI tutor and earn XP.' },
]

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f13]">

      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-800 
                      sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f13]/80 
                      backdrop-blur-md">
        <div className="page-container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg 
                            flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              CourseAI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login"
              className="text-sm font-medium text-gray-600 
                         dark:text-gray-400 hover:text-gray-900 
                         dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary text-sm px-5 py-2">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="page-container pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 
                          dark:bg-primary-900/30 text-primary-700 
                          dark:text-primary-300 px-4 py-1.5 rounded-full 
                          text-sm font-medium mb-6 border border-primary-100 
                          dark:border-primary-800">
            <Sparkles size={14} />
            Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 
                         dark:text-white leading-tight mb-6 max-w-3xl mx-auto">
            Generate personalized
            <span className="text-primary-600"> AI courses </span>
            in seconds
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl 
                        mx-auto mb-10 leading-relaxed">
            Enter any topic and skill level — our AI builds a complete 
            structured course with quizzes, a chat tutor, and progress tracking.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup"
              className="btn-primary px-8 py-3 text-base flex items-center gap-2">
              Start for free
              <ChevronRight size={18} />
            </Link>
            <Link to="/login"
              className="btn-secondary px-8 py-3 text-base">
              Sign in
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-1 mt-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16}
                className="text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              Loved by 1,000+ learners
            </span>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="card p-6 text-left shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400"   />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400 ml-2">
                AI Course Generator
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-20 mt-1">Topic</span>
                <div className="flex-1 input-field text-sm py-2">
                  Machine Learning for Beginners
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-20 mt-1">Level</span>
                <div className="flex-1 bg-primary-50 dark:bg-primary-900/30 
                                border border-primary-200 dark:border-primary-800 
                                rounded-xl px-4 py-2 text-sm text-primary-700 
                                dark:text-primary-300">
                  Beginner
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-20 mt-1">Goal</span>
                <div className="flex-1 input-field text-sm py-2">
                  Build my first ML model
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <div className="btn-primary text-sm px-6 py-2 
                                flex items-center gap-2 cursor-default">
                  <Sparkles size={14} />
                  Generate Course
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              How it works
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              From topic to full course in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 text-center"
              >
                <div className="text-4xl font-bold text-primary-100 
                                dark:text-primary-900 mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 
                              leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Everything you need to learn
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              A complete AI-powered learning platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="card p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 
                                rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 
                              leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="card p-12 text-center bg-gradient-to-br 
                       from-primary-600 to-primary-700 border-0"
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to start learning?
            </h2>
            <p className="text-primary-200 mb-8 max-w-md mx-auto">
              Join thousands of learners generating personalized courses with AI.
            </p>
            <Link to="/signup"
              className="inline-flex items-center gap-2 bg-white 
                         text-primary-700 font-semibold px-8 py-3 
                         rounded-xl hover:bg-primary-50 
                         transition-all duration-200 active:scale-95">
              Get started free
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="page-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded-md 
                            flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              CourseAI
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 CourseAI. Built with Claude AI.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage