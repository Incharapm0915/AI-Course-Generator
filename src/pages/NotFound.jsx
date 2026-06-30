import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <p className="text-gray-500 dark:text-gray-400">Page not found</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  )
}
export default NotFound