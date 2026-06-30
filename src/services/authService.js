import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider, githubProvider } from '../lib/firebase'

// Create user document in Firestore
const createUserDoc = async (user, extraData = {}) => {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName || extraData.displayName || '',
      photoURL:    user.photoURL    || '',
      createdAt:   serverTimestamp(),
      streak:      0,
      xp:          0,
      badges:      [],
      coursesGenerated: 0,
      ...extraData,
    })
  }
}

// Sign up with email & password
export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  await createUserDoc(result.user, { displayName })
  return result.user
}

// Login with email & password
export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

// Sign in with Google
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  await createUserDoc(result.user)
  return result.user
}

// Sign in with GitHub
export const loginWithGitHub = async () => {
  const result = await signInWithPopup(auth, githubProvider)
  await createUserDoc(result.user)
  return result.user
}

// Sign out
export const logOut = async () => {
  await signOut(auth)
}

// Get user document from Firestore
export const getUserDoc = async (uid) => {
  const userRef  = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() : null
}
import { updateDoc, increment } from 'firebase/firestore'

// Update streak and XP
export const updateStreakAndXP = async (userId, xpToAdd = 10) => {
  const userRef  = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  const userData = userSnap.data()

  const lastActive  = userData?.lastActive?.toDate?.() || null
  const today       = new Date()
  const yesterday   = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let newStreak = userData?.streak || 0

  if (lastActive) {
    const lastDate = new Date(lastActive)
    const isSameDay = lastDate.toDateString() === today.toDateString()
    const isYesterday = lastDate.toDateString() === yesterday.toDateString()

    if (!isSameDay && isYesterday) {
      newStreak += 1
    } else if (!isSameDay && !isYesterday) {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }

  await updateDoc(userRef, {
    streak:     newStreak,
    xp:         increment(xpToAdd),
    lastActive: serverTimestamp(),
  })

  return newStreak
}

// Get user stats
export const getUserStats = async (userId) => {
  const userRef  = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? userSnap.data() : null
}