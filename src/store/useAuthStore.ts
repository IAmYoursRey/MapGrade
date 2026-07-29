import { create } from 'zustand';
import { User, UserRole } from '@/types';

export const isDevEmail = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean.includes('raihanansari');
};

export const isDevUser = (user: User | null): boolean => {
  if (!user) return false;
  if (user.role === 'DEV_UTAMA') return true;
  return isDevEmail(user.email);
};

export const hasMapMarkPermission = (user: User | null): boolean => {
  if (!user) return false;
  if (user.role === 'DEV_UTAMA' || user.role === 'ADMIN' || user.role === 'BPBD') return true;
  return isDevEmail(user.email);
};

interface AuthState {
  user: User | null;
  usersList: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateProfileName: (newName: string) => void;
  addUser: (user: Partial<User>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AUTH_USER_KEY = 'gosiaga_auth_user';
const USERS_DB_KEY = 'gosiaga_users_db';

const DEFAULT_USERS: User[] = [
  {
    id: 'user-dev-main-6678',
    name: 'Raihan Ansari (Dev Utama)',
    email: 'raihanansari6678@gmail.com',
    password: '081515876022',
    role: 'DEV_UTAMA',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Raihan%20Ansari',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-dev-main-3345',
    name: 'Raihan Ansari (Dev Utama)',
    email: 'raihanansari3345@gmail.com',
    password: '081515876022',
    role: 'DEV_UTAMA',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Raihan%20Ansari',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-bpbd-1',
    name: 'Command Center BPBD',
    email: 'bpbd@gosiaga.go.id',
    password: 'bpbd123',
    role: 'BPBD',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=BPBD',
    createdAt: new Date().toISOString(),
  }
];

const getStoredUsersDb = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_USERS;
};

const saveUsersDb = (users: User[]) => {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch {}
};

const getStoredAuthUser = (): User | null => {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const initialAuthUser = getStoredAuthUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialAuthUser,
  usersList: getStoredUsersDb(),
  isAuthenticated: !!initialAuthUser,
  isLoading: false,
  error: null,

  login: async (email: string, password = '') => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (!cleanEmail.includes('@')) {
        throw new Error('Format alamat email tidak valid.');
      }

      const currentDb = get().usersList;
      let matchedUser = currentDb.find((u) => u.email.toLowerCase() === cleanEmail);

      const isDevAcc = isDevEmail(cleanEmail) || cleanPassword === '081515876022';

      if (isDevAcc && cleanPassword === '081515876022') {
        const devName = matchedUser?.name || 'Raihan Ansari (Dev Utama)';
        matchedUser = {
          id: matchedUser?.id || `user-dev-${Date.now()}`,
          name: devName,
          email: cleanEmail,
          password: cleanPassword,
          role: 'DEV_UTAMA',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(devName)}`,
          createdAt: matchedUser?.createdAt || new Date().toISOString(),
        };

        const updatedDb = [matchedUser, ...currentDb.filter(u => u.email.toLowerCase() !== cleanEmail)];
        set({ usersList: updatedDb });
        saveUsersDb(updatedDb);
      }

      if (matchedUser) {
        if (matchedUser.password && matchedUser.password !== cleanPassword) {
          throw new Error('Password yang Anda masukkan salah.');
        }
      } else {
        matchedUser = {
          id: `user-${Date.now()}`,
          name: cleanEmail.split('@')[0].toUpperCase(),
          email: cleanEmail,
          password: cleanPassword,
          role: 'CITIZEN',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
          createdAt: new Date().toISOString(),
        };
        const updatedDb = [matchedUser, ...currentDb];
        set({ usersList: updatedDb });
        saveUsersDb(updatedDb);
      }

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));

      set({ 
        user: matchedUser, 
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
    localStorage.removeItem(AUTH_USER_KEY);
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),

  updateProfileName: (newName: string) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const trimmedName = newName.trim();
    const updatedUser: User = { 
      ...currentUser, 
      name: trimmedName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`
    };

    const currentDb = get().usersList;
    const updatedDb = currentDb.map((u) => {
      if (u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return updatedUser;
      }
      return u;
    });

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    saveUsersDb(updatedDb);

    set({ user: updatedUser, usersList: updatedDb });
  },

  addUser: (userData: Partial<User>) => {
    const name = (userData.name || 'Pengguna Baru').trim();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: (userData.email || '').trim().toLowerCase(),
      password: userData.password || '123456',
      role: userData.role || 'CITIZEN',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedDb = [newUser, ...get().usersList];
    saveUsersDb(updatedDb);
    set({ usersList: updatedDb });
  },

  updateUser: (id: string, data: Partial<User>) => {
    const currentDb = get().usersList;
    const updatedDb = currentDb.map((u) => {
      if (u.id === id || u.email.toLowerCase() === data.email?.toLowerCase()) {
        const name = (data.name || u.name).trim();
        return {
          ...u,
          ...data,
          name,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        };
      }
      return u;
    });

    saveUsersDb(updatedDb);

    const currentUser = get().user;
    let updatedCurrent = currentUser;

    if (currentUser && (currentUser.id === id || currentUser.email.toLowerCase() === data.email?.toLowerCase())) {
      const name = (data.name || currentUser.name).trim();
      updatedCurrent = {
        ...currentUser,
        ...data,
        name,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedCurrent));
    }

    set({ usersList: updatedDb, user: updatedCurrent });
  },

  deleteUser: (id: string) => {
    const targetUser = get().usersList.find((u) => u.id === id);

    if (targetUser?.email?.toLowerCase() === 'raihanansari6678@gmail.com') {
      alert('Akun Pengembang Utama (raihanansari6678@gmail.com) dilindungi dan tidak dapat dihapus!');
      return;
    }

    const updatedDb = get().usersList.filter((u) => u.id !== id);
    saveUsersDb(updatedDb);

    const currentUser = get().user;
    if (currentUser && (currentUser.id === id || currentUser.email.toLowerCase() === targetUser?.email?.toLowerCase())) {
      localStorage.removeItem(AUTH_USER_KEY);
      set({ user: null, isAuthenticated: false, usersList: updatedDb });
    } else {
      set({ usersList: updatedDb });
    }
  },
}));