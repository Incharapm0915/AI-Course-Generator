import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// Save a new generated course
export const saveCourse = async (userId, courseData) => {
  const ref = await addDoc(collection(db, 'courses'), {
    ...courseData,
    userId,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
    progress:    0,
    completed:   false,
    bookmarked:  false,
    completedLessons: [],
  })
  return ref.id
}

// Get all courses for a user
export const getUserCourses = async (userId) => {
  const q = query(
    collection(db, 'courses'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Get a single course by ID
export const getCourse = async (courseId) => {
  const ref  = doc(db, 'courses', courseId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Course not found')
  return { id: snap.id, ...snap.data() }
}

// Mark a lesson as complete / incomplete
export const toggleLessonComplete = async (courseId, lessonId, completed) => {
  const ref      = doc(db, 'courses', courseId)
  const snap     = await getDoc(ref)
  const data     = snap.data()

  let completedLessons = data.completedLessons || []

  if (completed) {
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId)
    }
  } else {
    completedLessons = completedLessons.filter((id) => id !== lessonId)
  }

  // Calculate total lessons
  const totalLessons = data.modules?.reduce(
    (acc, mod) => acc + (mod.lessons?.length || 0), 0
  ) || 1

  const progress = Math.round((completedLessons.length / totalLessons) * 100)

  await updateDoc(ref, {
    completedLessons,
    progress,
    completed:  progress === 100,
    updatedAt:  serverTimestamp(),
  })

  return { completedLessons, progress }
}

// Toggle bookmark
export const toggleBookmark = async (courseId, bookmarked) => {
  const ref = doc(db, 'courses', courseId)
  await updateDoc(ref, {
    bookmarked,
    updatedAt: serverTimestamp(),
  })
}

// Save note for a lesson
export const saveLessonNote = async (courseId, lessonId, note) => {
  const ref = doc(db, 'courses', courseId)
  await updateDoc(ref, {
    [`notes.${lessonId}`]: note,
    updatedAt: serverTimestamp(),
  })
}

// Delete a course
export const deleteCourse = async (courseId) => {
  await deleteDoc(doc(db, 'courses', courseId))
}

// Save quiz result
export const saveQuizResult = async (userId, courseId, moduleId, result) => {
  await addDoc(collection(db, 'quizResults'), {
    userId,
    courseId,
    moduleId,
    ...result,
    createdAt: serverTimestamp(),
  })
}

// Get quiz results for a course
export const getQuizResults = async (userId, courseId) => {
  const q = query(
    collection(db, 'quizResults'),
    where('userId',   '==', userId),
    where('courseId', '==', courseId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}