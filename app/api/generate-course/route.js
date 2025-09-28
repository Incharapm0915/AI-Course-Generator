import { NextResponse } from 'next/server';
import { generateCourseContent } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { courseTitle, courseGoals } = await request.json();

    if (!courseTitle || !courseGoals) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const result = await generateCourseContent(courseTitle, courseGoals);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, courseData: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
