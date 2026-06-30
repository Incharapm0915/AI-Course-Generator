import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Youtube, Play, X, ExternalLink, Loader2 } from 'lucide-react'
import { fetchYouTubeVideos } from '../../services/youtubeService'

const YouTubeVideos = ({ lessonTitle, topic }) => {
  const [videos,   setVideos]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [playing,  setPlaying]  = useState(null)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    if (lessonTitle) {
      fetchVideos()
    }
  }, [lessonTitle])

  const fetchVideos = async () => {
    setLoading(true)
    setError(false)
    setPlaying(null)
    try {
      // Search using lesson title + course topic for better results
      const query   = `${lessonTitle} ${topic} tutorial`
      const results = await fetchYouTubeVideos(query, 3)
      setVideos(results)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Youtube size={18} className="text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Related Videos
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 
                              rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || videos.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Youtube size={18} className="text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Related Videos
          </h3>
        </div>
        <div className="text-center py-4">
          <Youtube size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            No videos found for this topic
          </p>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle + ' tutorial')}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700 
                       font-medium mt-2 inline-flex items-center gap-1"
          >
            Search on YouTube
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white 
                       flex items-center gap-2">
          <Youtube size={18} className="text-red-500" />
          Related Videos
        </h3>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lessonTitle + ' tutorial')}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary-600 hover:text-primary-700
                     font-medium flex items-center gap-1"
        >
          View more
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Embedded player */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0, height: 0   }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{    opacity: 0, height: 0   }}
            transition={{ duration: 0.3 }}
            className="mb-4 overflow-hidden"
          >
            <div className="relative rounded-xl overflow-hidden bg-black">
              <button
                onClick={() => setPlaying(null)}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-lg
                           bg-black/60 hover:bg-black/80 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
              <iframe
                src={`${playing}?autoplay=1&rel=0`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; 
                       encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video list */}
      <div className="space-y-3">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 8  }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className={`flex gap-3 cursor-pointer group rounded-xl p-2 -m-2
                       transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                       ${playing === video.embedUrl
                         ? 'bg-primary-50 dark:bg-primary-900/20'
                         : ''
                       }`}
            onClick={() => setPlaying(
              playing === video.embedUrl ? null : video.embedUrl
            )}
          >
            {/* Thumbnail */}
            <div className="relative w-32 h-20 rounded-xl overflow-hidden 
                            shrink-0 bg-gray-100 dark:bg-gray-800">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {/* Play overlay */}
              <div className={`absolute inset-0 flex items-center 
                              justify-center transition-all duration-200
                              ${playing === video.embedUrl
                                ? 'bg-primary-600/60'
                                : 'bg-black/30 group-hover:bg-black/50'
                              }`}>
                {playing === video.embedUrl ? (
                  <div className="w-8 h-8 rounded-full bg-white/90 
                                  flex items-center justify-center">
                    <X size={14} className="text-gray-800" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/90 
                                  flex items-center justify-center
                                  group-hover:scale-110 transition-transform">
                    <Play size={14} className="text-gray-800 ml-0.5" fill="currentColor" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className={`text-xs font-semibold leading-snug line-clamp-2
                            mb-1 transition-colors
                            ${playing === video.embedUrl
                              ? 'text-primary-600'
                              : 'text-gray-900 dark:text-white group-hover:text-primary-600'
                            }`}>
                {video.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {video.channel}
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary-500 hover:text-primary-600 
                           flex items-center gap-0.5 mt-1 w-fit"
              >
                Open in YouTube
                <ExternalLink size={10} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default YouTubeVideos