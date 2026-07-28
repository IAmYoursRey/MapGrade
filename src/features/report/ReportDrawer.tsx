import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { getDeviceId } from '@/utils/deviceId';
import { ValidationMeter } from '@/components/report/ValidationMeter';
import { X, MapPin, ThumbsUp, ThumbsDown, MessageSquare, Bot, Send, ShieldCheck, Image as ImageIcon, Trash2 } from 'lucide-react';

export const ReportDrawer: React.FC = () => {
  const store = useMapStore();
  const selectedReport = store.selectedReport;
  const isDrawerOpen = store.isDrawerOpen;
  const setIsDrawerOpen = store.setIsDrawerOpen;
  const addComment = store.addComment;
  const handleValidation = store.handleValidation;

  const [commentInput, setCommentInput] = useState('');
  const [commentPhoto, setCommentPhoto] = useState<string | null>(null);
  const currentDeviceId = getDeviceId();

  if (!isDrawerOpen || !selectedReport) return null;

  const safeValidVotes = selectedReport.validationsCount || 0;
  const safeInvalidVotes = selectedReport.invalidationsCount || 0;
  
  const hasVotedValid = selectedReport.votedBy?.includes(currentDeviceId) || false;
  const hasVotedInvalid = selectedReport.invalidatedBy?.includes(currentDeviceId) || false;

  const handleCommentPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCommentPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!commentInput.trim() && !commentPhoto) || typeof addComment !== 'function') return;
    addComment(selectedReport.id, commentInput.trim(), commentPhoto || undefined);
    setCommentInput('');
    setCommentPhoto(null);
  };

  return (
    <div className="absolute right-0 top-0 h-full w-full md:w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-[2000] animate-in slide-in-from-right">
      
      { }
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h2 className="font-bold text-white text-lg line-clamp-1">{selectedReport.title || 'Detail Laporan'}</h2>
        <button 
          onClick={() => setIsDrawerOpen && setIsDrawerOpen(false)} 
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      { }
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        { }
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Lat: {selectedReport.latitude?.toFixed(4) || 0}, Lng: {selectedReport.longitude?.toFixed(4) || 0}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedReport.description || 'Tidak ada deskripsi detail untuk laporan ini.'}
          </p>

          { }
          {selectedReport.photos && selectedReport.photos.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Foto Lapangan:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {selectedReport.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Dokumentasi ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-slate-700 shrink-0 hover:opacity-90 transition-opacity"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        { }
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

        { }
        <div className="p-4 rounded-2xl bg-blue-900/10 border border-blue-900/30">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <Bot className="w-5 h-5" />
            <span className="font-bold text-xs">AI Summary</span>
          </div>
          <p className="text-xs text-blue-200/70 italic">
            {selectedReport.aiSummary || 'AI sedang menganalisis tingkat risiko dan dampak...'}
          </p>
        </div>

        { }
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-slate-300">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold text-sm">Komentar & Bukti Foto ({selectedReport.commentsCount || 0})</h3>
          </div>
          
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2">
            {selectedReport.comments && selectedReport.comments.length > 0 ? (
              selectedReport.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${comment.authorId === currentDeviceId ? 'text-red-400' : 'text-slate-300'}`}>
                      {comment.authorId} {comment.authorId === currentDeviceId && '(Anda)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{comment.createdAt || 'Baru saja'}</span>
                  </div>
                  {comment.text && <p className="text-slate-300 text-xs">{comment.text}</p>}
                  {comment.photoUrl && (
                    <img
                      src={comment.photoUrl}
                      alt="Foto Lampiran Komentar"
                      className="mt-1 rounded-lg max-h-36 w-full object-cover border border-slate-700"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada tanggapan warga.</p>
            )}
          </div>

          <form onSubmit={handleSendComment} className="space-y-2 pt-2 border-t border-slate-800">
            {commentPhoto && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                <img src={commentPhoto} alt="Preview Bukti" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCommentPhoto(null)}
                  className="absolute top-1 right-1 p-0.5 bg-red-600 rounded-full text-white"
                  title="Hapus foto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <label className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer transition-all border border-slate-700" title="Unggah Foto Bukti">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCommentPhotoSelect}
                  className="hidden"
                />
              </label>
              <input
                type="text"
                placeholder={`Komentar / bukti sebagai ${currentDeviceId}...`}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder:text-slate-500"
              />
              <button type="submit" className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};