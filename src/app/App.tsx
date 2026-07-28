import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useThemeStore } from '@/store/useThemeStore';

export const App: React.FC = () => {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;