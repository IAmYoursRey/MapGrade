import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Users, LogOut, Menu, X, Sun, Moon, Edit3 } from 'lucide-react';
import { useAuthStore, isDevUser as checkIsDevUser } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { NotificationDropdown } from '@/components/common/NotificationDropdown'; 

export const DashboardLayout: React.FC = () => {
  const { user, logout, updateProfileName } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');

  const isDev = checkIsDevUser(user);

  const navItems = [
    { path: '/dashboard/bpbd', label: 'Command Center', icon: LayoutDashboard },
    ...(isDev ? [{ path: '/dashboard/admin', label: 'Manajemen User (Dev)', icon: Users }] : []),
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      updateProfileName(newUsername.trim());
      setIsEditingUsername(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 relative">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex shrink-0">
        <header className="p-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/" className="flex items-center gap-2 group">
            <figure className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </figure>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              GoSiaga
            </span>
          </Link>
          <section className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-1">
            <p className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              {isDev ? 'DEV UTAMA (FULL ACCESS)' : (user?.role || 'PETUGAS')}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{user?.name || 'Raihan Ansari'}</p>
              <button
                onClick={() => { setNewUsername(user?.name || ''); setIsEditingUsername(true); }}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                title="Ubah Username"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </header>

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

        <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors text-sm font-semibold cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Keluar Sistem
          </button>
        </footer>
      </aside>

      <section className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 shrink-0 z-[900] relative">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <NotificationDropdown />
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-all text-xs flex items-center gap-1.5 border border-red-500/30 shrink-0"
              title="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <aside className="md:hidden fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex">
            <nav className="w-4/5 max-w-xs bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
              <header className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <figure className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </figure>
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
              </header>

              <section className="my-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  {isDev ? 'DEV UTAMA (FULL ACCESS)' : (user?.role || 'PETUGAS')}
                </p>
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
                  {user?.name || 'Raihan Ansari'}
                </p>
              </section>

              <div className="flex-1 space-y-2 py-2">
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
              </div>

              <footer className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors text-sm font-semibold cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Keluar Sistem
                </button>
              </footer>
            </nav>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </aside>
        )}

        {isEditingUsername && (
          <aside className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <article className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
              <header className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-red-500" />
                  Ubah Username Akun
                </h3>
                <button onClick={() => setIsEditingUsername(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </header>

              <form onSubmit={handleSaveUsername} className="space-y-4">
                <fieldset className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Username Baru</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-red-500"
                  />
                </fieldset>

                <footer className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingUsername(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white shadow-md shadow-red-600/30"
                  >
                    Simpan Nama
                  </button>
                </footer>
              </form>
            </article>
          </aside>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </section>
    </div>
  );
};