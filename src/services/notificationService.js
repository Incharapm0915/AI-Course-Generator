import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import useNotifStore from '../store/useNotifStore'

// Create a notification
export const createNotification = async (userId, notification) => {
  const docRef = await addDoc(collection(db, 'notifications'), {
    userId,
    ...notification,
    read:      false,
    createdAt: serverTimestamp(),
  })

  // Push into the in-memory store immediately so the bell updates without a reload
  useNotifStore.getState().addNotification({
    id:        docRef.id,
    userId,
    ...notification,
    read:      false,
    createdAt: new Date(),
  })
}

// Get all notifications for a user
export const getNotifications = async (userId) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

// Mark one as read
export const markAsRead = async (notifId) => {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
}

// Mark all as read
export const markAllAsRead = async (userId) => {
  const q    = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read',   '==', false)
  )
  const snap  = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }))
  await batch.commit()
}

// Delete a notification
export const deleteNotification = async (notifId) => {
  await deleteDoc(doc(db, 'notifications', notifId))
}

// Delete all notifications
export const clearAllNotifications = async (userId) => {
  const q    = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  )
  const snap  = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

// Notification templates
export const notify = {
  courseGenerated: (userId, courseTitle) =>
    createNotification(userId, {
      type:    'course',
      title:   'Course Generated! 🎉',
      message: `Your course "${courseTitle}" is ready to start.`,
      icon:    'sparkles',
      link:    '/my-courses',
    }),

  lessonCompleted: (userId, lessonTitle) =>
    createNotification(userId, {
      type:    'lesson',
      title:   'Lesson Complete! ✅',
      message: `You completed "${lessonTitle}". Keep going!`,
      icon:    'check',
      link:    '/my-courses',
    }),

  courseCompleted: (userId, courseTitle) =>
    createNotification(userId, {
      type:    'achievement',
      title:   'Course Completed! 🏆',
      message: `Amazing! You finished "${courseTitle}". Check your achievements!`,
      icon:    'trophy',
      link:    '/achievements',
    }),

  quizPassed: (userId, score, moduleTitle) =>
    createNotification(userId, {
      type:    'quiz',
      title:   'Quiz Passed! 🎯',
      message: `You scored ${score}% on "${moduleTitle}". Great job!`,
      icon:    'zap',
      link:    '/quizzes',
    }),

  quizFailed: (userId, score, moduleTitle) =>
    createNotification(userId, {
      type:    'quiz',
      title:   'Quiz Complete 📚',
      message: `You scored ${score}% on "${moduleTitle}". Review and try again!`,
      icon:    'zap',
      link:    '/quizzes',
    }),

  streakAlert: (userId, streak) =>
    createNotification(userId, {
      type:    'streak',
      title:   `${streak} Day Streak! 🔥`,
      message: `You're on a ${streak}-day learning streak. Keep it up!`,
      icon:    'flame',
      link:    '/dashboard',
    }),

  badgeEarned: (userId, badgeName) =>
    createNotification(userId, {
      type:    'achievement',
      title:   'Badge Earned! 🏅',
      message: `You earned the "${badgeName}" badge. Check your achievements!`,
      icon:    'trophy',
      link:    '/achievements',
    }),

  welcomeBack: (userId, name) =>
    createNotification(userId, {
      type:    'system',
      title:   `Welcome back, ${name}! 👋`,
      message: 'Ready to continue your learning journey?',
      icon:    'sparkles',
      link:    '/dashboard',
    }),
}