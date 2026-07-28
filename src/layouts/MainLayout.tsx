import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, MapPin, User, Moon, Sun, Menu, X, LogOut, Edit3, Shield } from 'lucide-react'; 
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';

export const MainLayout: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, logout, updateProfileName } = useAuthStore();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLogout = () => {
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
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <header className="sticky top-0 z-[999] backdrop-blur-md bg-opacity-80 border-b border-slate-700/50 px-4 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <figure className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-between p-2 shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-full h-full text-white" />
          </figure>
          <hgroup>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
              GoSiaga
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">Satu Laporan, Selamatkan Banyak Nyawa</span>
          </hgroup>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/" className="hover:text-red-500 transition-colors">Beranda</Link>
          <Link to="/map" className="flex items-center gap-1 hover:text-red-500 transition-colors">
            <MapPin className="w-4 h-4 text-red-500" />
            Peta Interaktif
          </Link>
          <Link to="/analytics/heatmap" className="hover:text-red-500 transition-colors">Heatmap Bencana</Link>
          {(user?.role === 'DEV_UTAMA' || user?.role === 'BPBD' || user?.role === 'ADMIN') && (
            <Link to="/dashboard/bpbd" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-bold">
              <Shield className="w-4 h-4" />
              Command Center
            </Link>
          )}
          {user?.role === 'DEV_UTAMA' && (
            <Link to="/dashboard/admin" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-bold">
              Manajemen User
            </Link>
          )}
          <Link to="/docs" className="hover:text-red-500 transition-colors">Dokumentasi</Link>
        </nav>

        <section className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                <User className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-slate-200">{user.name}</span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-red-500/20 text-red-400 rounded-md border border-red-500/30">
                  {user.role === 'DEV_UTAMA' ? 'Dev Utama' : user.role}
                </span>
                <button
                  onClick={() => { setNewUsername(user.name); setIsEditingUsername(true); }}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Ubah Username"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold transition-all border border-red-600/40"
                title="Keluar Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-600/20 transition-all hover:scale-105"
            >
              <User className="w-4 h-4" />
              Masuk
            </Link>
          )}

          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </section>
      </header>

      {isMobileMenuOpen && (
        <aside className={`md:hidden absolute top-[68px] left-0 w-full z-[998] border-b shadow-2xl transition-all animate-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <nav className="flex flex-col px-6 py-5 space-y-4 text-sm font-semibold">
            <Link to="/" onClick={toggleMobileMenu} className="hover:text-red-500 transition-colors">Beranda</Link>
            <Link to="/map" onClick={toggleMobileMenu} className="flex items-center gap-2 hover:text-red-500 transition-colors">
              <MapPin className="w-4 h-4 text-red-500" />
              Peta Interaktif
            </Link>
            <Link to="/analytics/heatmap" onClick={toggleMobileMenu} className="hover:text-red-500 transition-colors">Heatmap Bencana</Link>
            {(user?.role === 'DEV_UTAMA' || user?.role === 'BPBD' || user?.role === 'ADMIN') && (
              <Link to="/dashboard/bpbd" onClick={toggleMobileMenu} className="text-amber-400 font-bold">
                Command Center BPBD
              </Link>
            )}
            {user?.role === 'DEV_UTAMA' && (
              <Link to="/dashboard/admin" onClick={toggleMobileMenu} className="text-purple-400 font-bold">
                Manajemen User (Dev)
              </Link>
            )}
            <Link to="/docs" onClick={toggleMobileMenu} className="hover:text-red-500 transition-colors">Dokumentasi</Link>
            
            <section className="pt-4 border-t border-slate-700/50 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl">
                    <span className="text-xs font-bold text-slate-200">{user.name} ({user.role})</span>
                    <button
                      onClick={() => { setNewUsername(user.name); setIsEditingUsername(true); toggleMobileMenu(); }}
                      className="text-xs text-red-400 font-bold"
                    >
                      Ubah Name
                    </button>
                  </div>
                  <button
                    onClick={() => { handleLogout(); toggleMobileMenu(); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Akun
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={toggleMobileMenu}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
                >
                  <User className="w-4 h-4" />
                  Masuk
                </Link>
              )}
            </section>
          </nav>
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

      <main className="flex-1 relative z-0">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 GoSiaga — Platform Pemetaan Bencana Real-time Berbasis Partisipasi Masyarakat.</p>
      </footer>
    </div>
  );
};