// components/CourseForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { useUser, redirectToSignIn } from '@clerk/nextjs';
import { createCourse } from '@/lib/firebase';

export default function CourseForm() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [courseTitle, setCourseTitle] = useState('');
  const [courseGoals, setCourseGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Wait until user is loaded
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirectToSignIn({ redirectBack: true });
    }
  }, [isLoaded, isSignedIn]);

  // Prevent render until user is loaded and signed in
  if (!isLoaded || !isSignedIn) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  const userId = user?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedContent(null);
    setSaveStatus(null);

    if (!userId) {
      setError('Authentication error: User ID not found.');
      setLoading(false);
      return;
    }

    try {
      // 1. Generate course content using backend API
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseTitle, courseGoals }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to generate course content.');
        setLoading(false);
        return;
      }

      setGeneratedContent(data.courseData);

      // 2. Save the generated course to Firebase
      const courseDataToSave = {
        title: courseTitle,
        goals: courseGoals,
        userId,
        content: data.courseData,
        createdAt: new Date().toISOString(),
      };

      const saveResult = await createCourse(courseDataToSave);

      if (saveResult.success) {
        setSaveStatus('Course saved successfully!');
      } else {
        setError('Failed to save course: ' + saveResult.error);
      }
    } catch (err) {
      setError('Error generating and saving course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Course Title
          </label>
          <input
            id="title"
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter the course title"
          />
        </div>
        <div>
          <label htmlFor="goals" className="block font-medium mb-1">
            Learning Goals / Objectives
          </label>
          <textarea
            id="goals"
            rows="4"
            value={courseGoals}
            onChange={(e) => setCourseGoals(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter learning objectives"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Course'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {saveStatus && <p className="mt-4 text-green-600">{saveStatus}</p>}

      {generatedContent && (
        <div className="mt-6 p-4 border border-gray-300 rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Generated Course Content</h3>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(generatedContent, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
