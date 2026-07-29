import { create } from 'zustand';

export type ToastType = 'info' | 'warning' | 'error' | 'success';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  createdAt?: string;
}

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
  toasts: ToastItem[];
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  addToast: (item: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  toasts: [],

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

  addToast: (item) => set((state) => {
    const newToast: ToastItem = {
      ...item,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    return { toasts: [...state.toasts, newToast] };
  }),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}));