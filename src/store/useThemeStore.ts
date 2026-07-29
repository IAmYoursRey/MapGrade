import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('gosiaga_theme');
  return stored ? stored === 'dark' : true;
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: getInitialTheme(),

  toggleTheme: () => set((state) => {
    const next = !state.isDarkMode;
    localStorage.setItem('gosiaga_theme', next ? 'dark' : 'light');
    return { isDarkMode: next };
  }),

  setTheme: (isDark: boolean) => {
    localStorage.setItem('gosiaga_theme', isDark ? 'dark' : 'light');
    set({ isDarkMode: isDark });
  },
}));
