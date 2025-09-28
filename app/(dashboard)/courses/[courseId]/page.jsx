'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, redirectToSignIn } from '@clerk/nextjs';
import { getCourseById, updateCourse } from '@/lib/firebase';
import ReactJson from 'react-json-view';
import { jsPDF } from 'jspdf';

export default function CourseDetailPage({ params }) {
  const { courseId } = params;
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [goals, setGoals] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirectToSignIn({ redirectBack: true });
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchCourse();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchCourse() {
    setLoading(true);
    setError(null);
    try {
      const result = await getCourseById(courseId);
      if (result.success) {
        if (result.course.userId !== user.id) {
          setError('You are not authorized to view this course.');
          setLoading(false);
          return;
        }
        setCourse(result.course);
        setTitle(result.course.title);
        setGoals(result.course.goals);
        // Use JSON stringify or raw text for content editing
        setContent(JSON.stringify(result.course.content, null, 2));
      } else {
        setError(result.error || 'Course not found.');
      }
    } catch (err) {
      setError('Failed to fetch course.');
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        setError('Course content must be valid JSON.');
        setSaving(false);
        return;
      }

      const updateData = {
        title,
        goals,
        content: parsedContent,
        updatedAt: new Date().toISOString(),
      };

      const result = await updateCourse(courseId, updateData);

      if (result.success) {
        setSaveMessage('Course updated successfully!');
      } else {
        setError(result.error || 'Failed to update course.');
      }
    } catch {
      setError('An unexpected error occurred when saving.');
    }
    setSaving(false);
  }

  if (!isLoaded || loading) return <p className="text-center mt-10">Loading course...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1" htmlFor="title">
          Course Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1" htmlFor="goals">
          Learning Goals / Objectives
        </label>
        <textarea
          id="goals"
          rows="3"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1" htmlFor="content">
          Course Content (JSON format)
        </label>
        <textarea
          id="content"
          rows="12"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 font-mono text-sm"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {saveMessage && <p className="mt-4 text-green-600">{saveMessage}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
function exportCoursePDF(course) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text(course.title, 10, 20);

  doc.setFontSize(12);
  doc.text('Learning Goals:', 10, 30);
  doc.text(course.goals, 10, 40);

  doc.text('Course Content:', 10, 50);
  const contentText = JSON.stringify(course.content, null, 2);
  const splitContent = doc.splitTextToSize(contentText, 180);
  doc.text(splitContent, 10, 60);

  doc.save(`${course.title.replace(/\s+/g, '_')}.pdf`);
}
<button
  onClick={() => exportCoursePDF(course)}
  className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
>
  Export as PDF
</button>
