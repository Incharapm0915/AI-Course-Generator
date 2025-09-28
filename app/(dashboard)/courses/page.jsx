'use client';

import { useState, useEffect } from 'react';
import { useUser, redirectToSignIn } from '@clerk/nextjs';
import { getCourses } from '@/lib/firebase';
import CourseCard from '@/components/CourseCard';

export default function CoursesPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirectToSignIn({ redirectBack: true });
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchUserCourses();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchUserCourses() {
    setLoading(true);
    setError(null);
    try {
      const result = await getCourses(user.id);
      if (result.success) {
        setCourses(result.courses);
      } else {
        setError(result.error || 'Failed to fetch courses');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  }

  if (!isLoaded || loading) return <p className="text-center mt-10">Loading courses...</p>;

  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  if (courses.length === 0) return <p className="text-center mt-10">No courses found. Create one!</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
