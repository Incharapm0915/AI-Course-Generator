import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase-config';

export const getCourses = async (userId) => {
  try {
    const q = query(collection(db, 'courses'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, courses };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';

export const updateCourse = async (courseId, updateData) => {
  try {
    const docRef = doc(db, 'courses', courseId);
    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
