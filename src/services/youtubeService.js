const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search'

export const fetchYouTubeVideos = async (query, maxResults = 3) => {
  try {
    const params = new URLSearchParams({
      part:       'snippet',
      q:          query,
      maxResults,
      type:       'video',
      relevanceLanguage: 'en',
      videoDuration: 'medium',
      key:        YOUTUBE_API_KEY,
    })

    const response = await fetch(`${YOUTUBE_API_URL}?${params}`)

    if (!response.ok) throw new Error('YouTube API failed')

    const data = await response.json()

    return data.items.map((item) => ({
      id:          item.id.videoId,
      title:       item.snippet.title,
      channel:     item.snippet.channelTitle,
      thumbnail:   item.snippet.thumbnails.medium.url,
      description: item.snippet.description,
      url:         `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl:    `https://www.youtube.com/embed/${item.id.videoId}`,
    }))
  } catch (err) {
    console.error('YouTube fetch error:', err)
    return []
  }
}