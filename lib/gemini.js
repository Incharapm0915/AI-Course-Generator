// lib/gemini.js
import { GenerativeAIClient } from '@google/generative-ai';

const client = new GenerativeAIClient({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateCourseContent(courseTitle, courseGoals) {
  const prompt = `
  Generate a detailed and structured course outline and content for the course titled "${courseTitle}". 
  The learning objectives are ${courseGoals}. Include modules, lessons, and assessments.
  Provide the output in a JSON format with keys: modules (each with lessons and objectives).
  `;

  try {
    const response = await client.generateText({
      model: 'models/text-bison-001',
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    const content = response.text;
    // Try parsing JSON output from AI (may need error handling if not exact JSON)
    let courseData;
    try {
      courseData = JSON.parse(content);
    } catch(e) {
      console.error('Failed to parse Gemini response as JSON:', e);
      courseData = { rawText: content };
    }

    return { success: true, data: courseData };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { success: false, error: error.message };
  }
}
