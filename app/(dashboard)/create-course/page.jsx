// app/(dashboard)/create-course/page.jsx
import CourseForm from '@/components/CourseForm';

export default function CreateCoursePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Course</h1>
      <CourseForm />
    </main>
  );
}
