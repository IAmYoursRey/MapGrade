import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { User, UserRole } from '@/types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  Key, 
  Mail, 
  User as UserIcon,
  X,
  Lock,
  ShieldAlert
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user: currentUser, usersList = [], addUser, updateUser, deleteUser } = useAuthStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('BPBD');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({ name: name.trim(), email: email.trim(), password, role });
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !name.trim() || !email.trim()) return;

    updateUser(editingUser.id, {
      name: name.trim(),
      email: email.trim(),
      password: password || editingUser.password,
      role,
    });

    setEditingUser(null);
    resetForm();
  };

  const startEdit = (targetUser: User) => {
    setEditingUser(targetUser);
    setName(targetUser.name);
    setEmail(targetUser.email);
    setPassword(targetUser.password || '');
    setRole(targetUser.role);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('BPBD');
  };

  const isDevUtama = currentUser?.role === 'DEV_UTAMA' || currentUser?.email === 'raihanansari6678@gmail.com';

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <figure className="p-3 bg-purple-500/20 text-purple-500 rounded-2xl">
            <Users className="w-7 h-7" />
          </figure>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 tracking-wider">
                Hak Akses Pengembang Utama
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Manajemen Pengguna & Otoritas Sistem
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Kelola kredensial akun, tetapkan peran petugas BPBD/Admin, dan atur username pengguna
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </header>

      {!isDevUtama && (
        <aside className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Catatan: Anda mengakses halaman ini sebagai administrator. Pengatur utama penuh hanya dimiliki akun Developer Utama.</span>
        </aside>
      )}

      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Daftar Akun Terdaftar ({usersList.length})
          </span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Alamat Email</th>
                <th className="p-4">Password</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4 text-center">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full bg-slate-700" />
                    <div>
                      <div>{u.name}</div>
                      {u.email === 'raihanansari6678@gmail.com' && (
                        <span className="text-[9px] font-extrabold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          DEV UTAMA
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-xs font-mono">{u.email}</td>

                  <td className="p-4 text-xs font-mono">
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-400">
                      {u.password || '••••••••'}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.role === 'DEV_UTAMA'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : u.role === 'BPBD'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-slate-700/50 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="p-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEdit(u)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus akun ${u.name}?`)) deleteUser(u.id);
                        }}
                        disabled={u.email === 'raihanansari6678@gmail.com'}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-xl transition-all disabled:opacity-30"
                        title="Hapus User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {(isAddModalOpen || editingUser) && (
        <aside className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <article className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-white">
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                {editingUser ? 'Edit Akun Pengguna' : 'Tambah Pengguna Baru (Dev Authority)'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingUser(null); }}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </header>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <fieldset className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Nama / Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-red-500"
                    placeholder="Nama Pengguna"
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-red-500"
                    placeholder="user@gosiaga.go.id"
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-red-500"
                    placeholder="Password kustom"
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Peran / Otoritas (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-red-500 text-slate-200"
                >
                  <option value="BPBD">Petugas Command Center BPBD</option>
                  <option value="ADMIN">Administrator Sistem</option>
                  <option value="CITIZEN">Warga Sipil / Pelapor</option>
                  <option value="DEV_UTAMA">Pengembang Utama (Dev Utama)</option>
                </select>
              </fieldset>

              <footer className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingUser(null); }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-red-600/30"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Akun'}
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}
    </main>
  );
};
