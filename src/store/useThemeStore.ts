import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: true, // Default to dark mode as per existing MainLayout
  toggleTheme: () => set((state) => {
    const newMode = !state.isDarkMode;
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: newMode };
  }),
}));
