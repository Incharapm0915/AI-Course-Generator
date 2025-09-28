// components/CourseCard.jsx
import Link from 'next/link';

export default function CourseCard({ course }) {
  return (
    <div className="border p-4 rounded shadow-sm hover:shadow-md transition">
      <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
      <p className="mb-2 text-gray-700">{course.goals}</p>
      <Link href={`/dashboard/courses/${course.id}`}>
        <a className="text-blue-600 hover:underline">View / Edit Course</a>
      </Link>
    </div>
  );
}
