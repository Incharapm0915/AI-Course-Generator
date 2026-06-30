import { create } from 'zustand'

const useCourseStore = create((set) => ({
  courses:       [],
  currentCourse: null,
  loading:       false,
  error:         null,

  setCourses:       (courses)       => set({ courses }),
  setCurrentCourse: (course)        => set({ currentCourse: course }),
  setLoading:       (loading)       => set({ loading }),
  setError:         (error)         => set({ error }),

  addCourse: (course) => set((state) => ({
    courses: [course, ...state.courses],
  })),

  updateCourse: (courseId, updates) => set((state) => ({
    courses: state.courses.map((c) =>
      c.id === courseId ? { ...c, ...updates } : c
    ),
    currentCourse:
      state.currentCourse?.id === courseId
        ? { ...state.currentCourse, ...updates }
        : state.currentCourse,
  })),

  removeCourse: (courseId) => set((state) => ({
    courses: state.courses.filter((c) => c.id !== courseId),
  })),
}))

export default useCourseStore