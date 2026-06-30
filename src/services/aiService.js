import { generateCoursePrompt, generateQuizPrompt, chatTutorPrompt, generateFlashcardsPrompt } from '../lib/prompts'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const callGemini = async (prompt, retries = 2) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 65536,
      }
    }),
  })

  if (response.status === 429 && retries > 0) {
    await new Promise(res => setTimeout(res, 40000))
    return callGemini(prompt, retries - 1)
  }

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || 'AI request failed')
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const parseJSON = (text) => {
  try {
    let cleaned = text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim()

    const start = cleaned.indexOf('{')
    const end   = cleaned.lastIndexOf('}')

    if (start === -1 || end === -1) {
      throw new Error('No JSON found in response')
    }

    cleaned = cleaned.slice(start, end + 1)
    return JSON.parse(cleaned)

  } catch (err) {
    console.error('Parse error:', err)
    throw new Error('Failed to parse AI response. Please try again.')
  }
}

export const generateCourse = async ({ topic, level, duration, goal }) => {
  const prompt   = generateCoursePrompt({ topic, level, duration, goal })
  const response = await callGemini(prompt)
  console.log('Raw AI response:', response.substring(0, 200))
  const course   = parseJSON(response)
  return course
}

export const generateQuiz = async ({ moduleTitle, moduleDescription, lessonTitles }) => {
  const prompt   = generateQuizPrompt({ moduleTitle, moduleDescription, lessonTitles })
  const response = await callGemini(prompt)
  const quiz     = parseJSON(response)
  return quiz
}

export const chatWithTutor = async ({ courseTitle, courseDescription, userMessage, history }) => {
  const prompt   = chatTutorPrompt({ courseTitle, courseDescription, userMessage, history })
  const response = await callGemini(prompt)
  return response.trim()
}

export const callGeminiFlashcards = async ({ moduleTitle, lessons }) => {
  const prompt   = generateFlashcardsPrompt({ moduleTitle, lessons })
  const response = await callGemini(prompt)
  const data     = parseJSON(response)
  return data.flashcards
}