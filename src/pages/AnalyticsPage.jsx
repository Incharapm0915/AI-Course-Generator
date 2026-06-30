import { useState, useEffect } from 'react'
import { motion }              from 'framer-motion'
import {
  BarChart2, TrendingUp, Trophy,
  BookOpen, Zap, Target, Flame
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart,
  Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import toast                  from 'react-hot-toast'
import { getUserCourses }     from '../services/courseService'
import useAuthStore           from '../store/useAuthStore'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6']

const AnalyticsPage = () => {
  const { user }              = useAuthStore()
  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const data = await getUserCourses(user.uid)
      setCourses(data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Compute stats
  const totalCourses    = courses.length
  const totalLessons    = courses.reduce((acc, c) =>
    acc + (c.modules?.reduce((a, m) => a + m.lessons?.length, 0) || 0), 0)
  const completedLessons = courses.reduce((acc, c) =>
    acc + (c.completedLessons?.length || 0), 0)
  const avgProgress     = totalCourses > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / totalCourses)
    : 0
  const completedCourses = courses.filter((c) => c.progress === 100).length

  // Chart data — progress per course
  const progressData = courses.slice(0, 6).map((c) => ({
    name:     c.title?.split(' ').slice(0, 3).join(' ') + '...',
    progress: c.progress || 0,
    lessons:  c.completedLessons?.length || 0,
  }))

  // Pie chart — course levels
  const levelCounts = courses.reduce((acc, c) => {
    const lvl = c.level || 'unknown'
    acc[lvl]  = (acc[lvl] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(levelCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  // Line chart — simulated weekly activity
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const activityData = weekDays.map((day) => ({
    day,
    lessons: Math.floor(Math.random() * 5),
    xp:      Math.floor(Math.random() * 100),
  }))

  const stats = [
    {
      label: 'Total Courses',
      value:  totalCourses,
      icon:  <BookOpen  size={20} />,
      color: 'text-blue-500',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Lessons Done',
      value:  completedLessons,
      icon:  <Zap       size={20} />,
      color: 'text-green-500',
      bg:    'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Avg Progress',
      value: `${avgProgress}%`,
      icon:  <TrendingUp size={20} />,
      color: 'text-purple-500',
      bg:    'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Completed',
      value:  completedCourses,
      icon:  <Trophy    size={20} />,
      color: 'text-orange-500',
      bg:    'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1"  />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3"       />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Track your learning progress and performance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="card p-5"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl 
                            flex items-center justify-center mb-3`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Course progress bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 
                         flex items-center gap-2">
            <BarChart2 size={18} className="text-primary-600" />
            Course Progress
          </h2>

          {progressData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-gray-400">No course data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progressData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Progress']}
                  contentStyle={{
                    fontSize:     12,
                    borderRadius: 8,
                    border:       '1px solid #e5e7eb',
                  }}
                />
                <Bar
                  dataKey="progress"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Level distribution pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 
                         flex items-center gap-2">
            <Target size={18} className="text-primary-600" />
            Course Levels
          </h2>

          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-gray-400">No course data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize:     12,
                    borderRadius: 8,
                    border:       '1px solid #e5e7eb',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Weekly activity line chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 
                       flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600" />
          Weekly Activity
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={activityData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize:     12,
                borderRadius: 8,
                border:       '1px solid #e5e7eb',
              }}
            />
            <Line
              type="monotone"
              dataKey="lessons"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4, fill: '#6366f1' }}
              name="Lessons"
            />
            <Line
              type="monotone"
              dataKey="xp"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4, fill: '#22c55e' }}
              name="XP"
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Course list with progress */}
      {courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            All Courses
          </h2>
          <div className="space-y-4">
            {courses.map((course) => {
              const total     = course.modules?.reduce(
                (a, m) => a + m.lessons?.length, 0) || 0
              const completed = course.completedLessons?.length || 0

              return (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700 
                                  dark:text-gray-300 truncate max-w-[60%]">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{completed}/{total} lessons</span>
                      <span className="font-semibold text-primary-600">
                        {course.progress || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress || 0}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full
                                 ${course.progress === 100
                                   ? 'bg-green-500'
                                   : 'bg-primary-600'
                                 }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AnalyticsPage