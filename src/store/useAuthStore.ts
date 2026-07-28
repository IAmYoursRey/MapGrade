import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const STORAGE_KEY = 'gosiaga_auth_user';

const getStoredUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,
  error: null,

  login: async (email: string, password = '', role: UserRole = 'CITIZEN') => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (!cleanEmail.includes('@')) {
        throw new Error('Format alamat email tidak valid.');
      }

      let assignedRole: UserRole = role;
      let name = cleanEmail.split('@')[0].toUpperCase();

      if (cleanEmail === 'raihanansari6678@gmail.com' && cleanPassword === '081515876022') {
        assignedRole = 'BPBD';
        name = 'Raihan Ansari (Developer)';
      }

      const authenticatedUser: User = {
        id: 'user-dev-6678',
        name,
        email: cleanEmail,
        role: assignedRole,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));

      set({ 
        user: authenticatedUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return true;
    } catch (error: any) {
      set({ 
        error: error.message || 'Gagal melakukan otentikasi pengguna.', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));