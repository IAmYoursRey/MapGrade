import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { getDeviceId } from '@/utils/deviceId';
import { Send, User, MessageSquare } from 'lucide-react';

export const CommentSection: React.FC<{ reportId: string }> = ({ reportId }) => {
  const { reports, addComment } = useMapStore();
  const report = reports.find((r) => r.id === reportId);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(reportId, text);
    setText('');
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-red-500" />
        <h3 className="font-bold text-sm">Diskusi Warga ({report?.comments?.length || 0})</h3>
      </div>

      { }
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {report?.comments?.map((c) => (
          <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1">
                <User className="w-3 h-3" />
                {c.authorId}
              </span>
              <span className="text-[10px] text-slate-400">{c.createdAt}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{c.text}</p>
          </div>
        ))}
        {(!report?.comments || report.comments.length === 0) && (
          <p className="text-xs text-slate-400 italic text-center py-2">Belum ada komentar. Berikan info terkini!</p>
        )}
      </div>

      { }
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={`Kirim info sebagai ${getDeviceId()}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};