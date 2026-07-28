import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, role: UserRole = 'CITIZEN') => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (!email.includes('@')) {
        throw new Error('Format email tidak valid.');
      }

      const mockUser: User = {
        id: crypto.randomUUID(),
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: role,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      };

      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Terjadi kesalahan saat login.', 
        isLoading: false 
      });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));