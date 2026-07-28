import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (item) => set((state) => {
    const newItem: NotificationItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    const updated = [newItem, ...state.notifications];
    return {
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    };
  }),

  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return {
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    };
  }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));