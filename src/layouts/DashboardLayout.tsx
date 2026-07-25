import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Map, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationDropdown } from '@/components/common/NotificationDropdown'; // 👈 Import Notifikasi di sini

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { path: '/dashboard/bpbd', label: 'Command Center', icon: LayoutDashboard },
    { path: '/analytics/heatmap', label: 'Heatmap Zonasi', icon: Map },
    { path: '/dashboard/admin', label: 'Manajemen User', icon: Users },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // Fungsi Keluar Sistem yang diarahkan ke halaman utama
  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 relative">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              GoSiaga
            </span>
          </Link>
          <div className="mt-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              {user?.role || 'PETUGAS'}
            </p>
            <p className="text-sm font-semibold truncate">{user?.name || 'Admin BPBD'}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-600 dark:text-red-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 shrink-0 z-[900] relative">
          <div className="flex items-center gap-3">
            {/* Tombol Menu Khusus HP */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              title="Buka Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <h1 className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100 truncate">
              Sistem Pemantauan Terpadu
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 🔔 KOMPONEN NOTIFIKASI AKTIF MENGGANTIKAN DUMMY BELL */}
            <NotificationDropdown />
          </div>
        </header>

        {/* Drawer Menu Navigasi Layar HP */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex">
            <div className="w-4/5 max-w-xs bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                    GoSiaga
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  {user?.role || 'PETUGAS'}
                </p>
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
                  {user?.name || 'Admin BPBD'}
                </p>
              </div>

              <nav className="flex-1 space-y-2 py-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        isActive 
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-red-600 dark:text-red-400' : ''}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors text-sm font-semibold cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Keluar Sistem
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};