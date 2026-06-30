export const generateCoursePrompt = ({
  topic,
  level,
  duration,
  goal,
}) => `
You are an expert course designer. Create a structured course based on:

Topic: ${topic}
Skill Level: ${level}
Duration: ${duration} weeks
Learning Goal: ${goal}

Respond with ONLY a valid JSON object:
{
  "title": "Course title",
  "description": "2 sentence overview",
  "level": "${level}",
  "duration": "${duration} weeks",
  "goal": "${goal}",
  "outcomes": ["outcome 1", "outcome 2", "outcome 3"],
  "modules": [
    {
      "id": "module-1",
      "title": "Module title",
      "description": "What this module covers",
      "order": 1,
      "lessons": [
        {
          "id": "lesson-1-1",
          "title": "Lesson title",
          "description": "What this lesson covers",
          "duration": "20 mins",
          "order": 1,
          "content": "2-3 paragraph lesson content",
          "keyPoints": ["point 1", "point 2", "point 3"],
          "resources": [
            {
              "title": "Resource name",
              "type": "article",
              "url": "https://example.com"
            }
          ]
        }
      ]
    }
  ],
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- Create exactly 4 modules
- Each module has exactly 3 lessons
- Keep content concise
- Start response directly with {
- End response with }
- No text before or after JSON
`

export const generateQuizPrompt = ({ moduleTitle, moduleDescription, lessonTitles }) => `
You are an expert quiz creator. Create a quiz for this course module:

Module: ${moduleTitle}
Description: ${moduleDescription}
Lessons covered: ${lessonTitles.join(', ')}

Respond with ONLY a valid JSON object:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Rules:
- Create exactly 5 questions
- Each question has exactly 4 options
- correctIndex is 0-3 (index of correct option)
- Explanations should be clear and educational
- Start response directly with {
- No text before or after JSON
`

export const chatTutorPrompt = ({ courseTitle, courseDescription, userMessage, history }) => `
You are a helpful AI tutor for the course: "${courseTitle}".

Course overview: ${courseDescription}

Your role:
- Answer questions related to the course content
- Explain concepts clearly with examples
- Encourage the learner
- Keep responses concise but thorough
- If asked something unrelated, gently redirect to the course

Conversation history:
${history.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n')}

Student: ${userMessage}
Tutor:`

export const generateFlashcardsPrompt = ({ moduleTitle, lessons }) => `
You are an expert educator. Create flashcards for this module:

Module: ${moduleTitle}
Lessons: ${lessons.join(', ')}

Respond with ONLY a valid JSON object:
{
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Question or concept",
      "back": "Answer or explanation",
      "hint": "Optional short hint"
    }
  ]
}

Rules:
- Create exactly 8 flashcards
- Front should be a question or key concept
- Back should be the clear answer
- Start response with {
- No text before or after JSON
`