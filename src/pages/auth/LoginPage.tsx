import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const success = await login(email, password);
    if (success) {
      const user = useAuthStore.getState().user;
      const targetRoute = (user?.role === 'DEV_UTAMA' || user?.role === 'BPBD' || user?.role === 'ADMIN')
        ? '/dashboard/bpbd'
        : '/map';
      navigate(targetRoute);
    }
  };

  return (
    <main className="min-h-[90vh] flex items-center justify-center p-4 relative overflow-hidden">
      <section className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
      <section className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <article className="w-full max-w-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-8 relative z-10">
        <header className="flex flex-col items-center mb-8 text-center">
          <figure className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 mb-4">
            <ShieldAlert className="w-7 h-7 text-white" />
          </figure>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang Kembali</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Masuk untuk melanjutkan pelaporan dan pemantauan data bencana.</p>
        </header>

        {error && (
          <aside className="mb-6 p-3 bg-red-100/50 border border-red-500/50 text-red-600 rounded-lg text-sm text-center">
            {error}
          </aside>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <fieldset className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                placeholder="nama@email.com"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </fieldset>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all hover:-translate-y-1 shadow-lg shadow-red-600/30 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk ke GoSiaga'}
          </button>
        </form>

        <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Belum memiliki akun?{' '}
          <Link to="/auth/register" className="font-bold text-red-600 hover:text-red-500 transition-colors">
            Daftar Sekarang
          </Link>
        </footer>
      </article>
    </main>
  );
};