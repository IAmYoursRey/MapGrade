import React, { useState } from 'react';
import { Send, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// Mock Data Komentar
const initialComments = [
  { id: '1', name: 'Budi Santoso', role: 'CITIZEN', text: 'Api sudah mulai menjalar ke arah utara, mohon segera kirim unit pemadam!', time: '10 mnt lalu' },
  { id: '2', name: 'Petugas BPBD (Andi)', role: 'BPBD', text: 'Unit sudah meluncur ke lokasi. Warga dimohon menjauhi radius 500 meter.', time: '5 mnt lalu' },
];

export const CommentSection: React.FC = () => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    // Simulasi pengiriman ke backend
    setTimeout(() => {
      setComments([
        {
          id: crypto.randomUUID(),
          name: user?.name || 'Anonim',
          role: user?.role || 'CITIZEN',
          text: newComment,
          time: 'Baru saja',
        },
        ...comments,
      ]);
      setNewComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
        Diskusi Warga ({comments.length})
      </h3>

      {/* Form Input Komentar */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <div className="w-10 h-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-5 h-5 text-slate-500" />
          )}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Tambahkan informasi lapangan..." : "Login untuk berkomentar..."}
            disabled={!user || isSubmitting}
            className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 outline-none text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!user || !newComment.trim() || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* List Komentar */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500">{comment.name.charAt(0)}</span>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{comment.name}</span>
                  {comment.role === 'BPBD' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      PETUGAS
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">{comment.time}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};