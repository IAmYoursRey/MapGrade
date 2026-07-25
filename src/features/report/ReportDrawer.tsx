import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { getDeviceId } from '@/utils/deviceId';
import { ValidationMeter } from '@/components/report/ValidationMeter';
import { X, MapPin, ThumbsUp, ThumbsDown, MessageSquare, Bot, Send, ShieldCheck } from 'lucide-react';

export const ReportDrawer: React.FC = () => {
  // ... sisa isi kode tetap sama
  const store = useMapStore();
  const selectedReport = store.selectedReport;
  const isDrawerOpen = store.isDrawerOpen;
  const setIsDrawerOpen = store.setIsDrawerOpen;
  const addComment = store.addComment;
  const handleValidation = store.handleValidation;

  const [commentInput, setCommentInput] = useState('');
  const currentDeviceId = getDeviceId();

  // Jika laci ditutup atau tidak ada laporan yang dipilih, jangan render apa-apa
  if (!isDrawerOpen || !selectedReport) return null;

  // 2. Mencegah Error Data Kosong / NaN
  const safeValidVotes = selectedReport.validationsCount || 0;
  const safeInvalidVotes = selectedReport.invalidationsCount || 0;
  
  const hasVotedValid = selectedReport.votedBy?.includes(currentDeviceId) || false;
  const hasVotedInvalid = selectedReport.invalidatedBy?.includes(currentDeviceId) || false;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || typeof addComment !== 'function') return;
    addComment(selectedReport.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="absolute right-0 top-0 h-full w-full md:w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-[2000] animate-in slide-in-from-right">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h2 className="font-bold text-white text-lg line-clamp-1">{selectedReport.title || 'Detail Laporan'}</h2>
        <button 
          onClick={() => setIsDrawerOpen && setIsDrawerOpen(false)} 
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Info Lokasi */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Lat: {selectedReport.latitude?.toFixed(4) || 0}, Lng: {selectedReport.longitude?.toFixed(4) || 0}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedReport.description || 'Tidak ada deskripsi detail untuk laporan ini.'}
          </p>
        </div>

        {/* Validation Section (Crowd-Validation 1x Vote) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-inner">
          <div className="flex items-center gap-2 text-xs mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="font-bold text-white">Verifikasi Massa (Crowd-Validation)</p>
              <p className="text-[10px] text-slate-400">ID Anda: <span className="text-slate-300 font-medium">{currentDeviceId}</span></p>
            </div>
          </div>

          <ValidationMeter validVotes={safeValidVotes} invalidVotes={safeInvalidVotes} />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleValidation && handleValidation(selectedReport.id, 'valid')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                hasVotedValid ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> {hasVotedValid ? '✔ Valid' : 'Valid'}
            </button>
            <button
              type="button"
              onClick={() => handleValidation && handleValidation(selectedReport.id, 'invalid')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                hasVotedInvalid ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <ThumbsDown className="w-4 h-4" /> {hasVotedInvalid ? '✔ Hoaks' : 'Hoaks'}
            </button>
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-4 rounded-2xl bg-blue-900/10 border border-blue-900/30">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <Bot className="w-5 h-5" />
            <span className="font-bold text-xs">AI Summary</span>
          </div>
          <p className="text-xs text-blue-200/70 italic">
            {selectedReport.aiSummary || 'AI sedang menganalisis tingkat risiko dan dampak...'}
          </p>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-slate-300">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold text-sm">Komentar Warga ({selectedReport.commentsCount || 0})</h3>
          </div>
          
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
            {selectedReport.comments && selectedReport.comments.length > 0 ? (
              selectedReport.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${comment.authorId === currentDeviceId ? 'text-red-400' : 'text-slate-300'}`}>
                      {comment.authorId} {comment.authorId === currentDeviceId && '(Anda)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{comment.createdAt || 'Baru saja'}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada tanggapan warga.</p>
            )}
          </div>

          <form onSubmit={handleSendComment} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder={`Komentar sebagai ${currentDeviceId}...`}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder:text-slate-500"
            />
            <button type="submit" className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};