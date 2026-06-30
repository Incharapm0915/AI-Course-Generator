import { create } from 'zustand'

const useNotifStore = create((set) => ({
  notifications: [],
  unreadCount:   0,

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  }),

  addNotification: (notif) => set((state) => ({
    notifications: [notif, ...state.notifications],
    unreadCount:   state.unreadCount + (notif.read ? 0 : 1),
  })),

  markRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount:   0,
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
    unreadCount:   state.notifications.find((n) => n.id === id && !n.read)
      ? state.unreadCount - 1
      : state.unreadCount,
  })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))

export default useNotifStore
