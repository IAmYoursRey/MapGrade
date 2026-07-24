import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert, MapPin, User, Moon, Sun } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-80 border-b border-slate-700/50 px-4 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-between p-2 shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-full h-full text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
              GoSiaga
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">Satu Laporan, Selamatkan Banyak Nyawa</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/" className="hover:text-red-500 transition-colors">Beranda</Link>
          <Link to="/map" className="flex items-center gap-1 hover:text-red-500 transition-colors">
            <MapPin className="w-4 h-4 text-red-500" />
            Peta Interaktif
          </Link>
          <Link to="/analytics/heatmap" className="hover:text-red-500 transition-colors">Heatmap Bencana</Link>
          <Link to="/docs" className="hover:text-red-500 transition-colors">Dokumentasi</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <Link
            to="/auth/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-600/20 transition-all hover:scale-105"
          >
            <User className="w-4 h-4" />
            Masuk
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 GoSiaga — Platform Pemetaan Bencana Real-time Berbasis Partisipasi Masyarakat.</p>
      </footer>
    </div>
  );
};