import React, { useState } from 'react';
import { useMapStore, ReportStatus } from '@/store/useMapStore';
import { getDeviceId } from '@/utils/deviceId';
import { ValidationMeter } from '@/components/report/ValidationMeter'; // <-- TAMBAHKAN INI
import { 
  X, 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, // <-- TAMBAHKAN INI
  MessageSquare, 
  Clock, 
  Bot, 
  Send, 
  ShieldCheck 
} from 'lucide-react';

export const ReportDrawer: React.FC = () => {
  const { selectedReport, isDrawerOpen, setIsDrawerOpen, addComment, handleValidation } = useMapStore();
  const currentDeviceId = getDeviceId();

  if (!isDrawerOpen || !selectedReport) return null;

  // Cek status vote dari perangkat saat ini
  const hasVotedValid = selectedReport.votedBy?.includes(currentDeviceId);
  const hasVotedInvalid = selectedReport.invalidatedBy?.includes(currentDeviceId);
  const [commentInput, setCommentInput] = useState('');
  const currentDeviceId = getDeviceId();

  if (!isDrawerOpen || !selectedReport) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    addComment(selectedReport.id, commentInput.trim());
    setCommentInput('');
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'UNVERIFIED': 
        return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[11px] font-bold">🔴 Baru (Belum Verifikasi)</span>;
      case 'NEEDS_REVIEW': 
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-bold">🟠 Diverifikasi Warga</span>;
      case 'IN_PROGRESS': 
        return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[11px] font-bold">🔵 Ditangani BPBD</span>;
      case 'RESOLVED': 
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-bold">🟢 Selesai</span>;
      default: 
        return <span className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-full text-[11px] font-bold">⚫ Arsip</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[2000] w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {getStatusBadge(selectedReport.status)}
        </div>
        <button 
          onClick={() => setIsDrawerOpen(false)}
          className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white leading-snug">{selectedReport.title}</h2>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span>Lat: {selectedReport.latitude.toFixed(4)}, Lng: {selectedReport.longitude.toFixed(4)}</span>
          </div>
        </div>

        {/* AI Summary */}
        {selectedReport.aiSummary && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>AI Hazard Analysis</span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">{selectedReport.aiSummary}</p>
          </div>
        )}

        {/* Photos */}
        {selectedReport.photos && selectedReport.photos.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dokumentasi Lapangan</h3>
            <div className="grid grid-cols-2 gap-2">
              {selectedReport.photos.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt="Dokumentasi" 
                  className="w-full h-32 object-cover rounded-2xl border border-slate-800"
                />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{selectedReport.description}</p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 text-xs text-slate-400">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Estimasi Korban</span>
              <span className="font-bold text-slate-200">{selectedReport.casualties || 0} Jiwa</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Kerusakan</span>
              <span className="font-bold text-slate-200">{selectedReport.damage || '-'}</span>
            </div>
          </div>
        </div>

        {/* Validation Section (Crowd-Validation 1x Vote per Device ID) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="font-bold text-white">Verifikasi Massa (Crowd-Validation)</p>
              <p className="text-[10px] text-slate-400">
                ID Anda: <span className="text-slate-300 font-medium">{currentDeviceId}</span>
              </p>
            </div>
          </div>

          {/* Visualisasi Persentase Valid vs Hoaks */}
          <ValidationMeter 
            validVotes={selectedReport.validationsCount || 0} 
            invalidVotes={selectedReport.invalidationsCount || 0} 
          />

          {/* Tombol Opsi Validasi */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleValidation(selectedReport.id, 'valid')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                hasVotedValid 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              {hasVotedValid ? '✔ Terverifikasi' : 'Informasi Valid'}
            </button>

            <button
              type="button"
              onClick={() => handleValidation(selectedReport.id, 'invalid')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                hasVotedInvalid 
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              {hasVotedInvalid ? '✔ Indikasi Hoaks' : 'Indikasi Hoaks'}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Timeline Penanganan</span>
          </h3>
          <div className="space-y-3 pl-2 border-l-2 border-slate-800">
            {selectedReport.timeline?.map((item) => (
              <div key={item.id} className="relative pl-4">
                <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-slate-900" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{item.title}</span>
                  <span className="text-[10px] text-slate-500">{item.time}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Diskusi Warga ({selectedReport.comments?.length || 0})</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-lg font-mono">
              ID: {currentDeviceId}
            </span>
          </div>

          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              placeholder={`Komentar sebagai ${currentDeviceId}...`}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2.5">
            {selectedReport.comments?.map((comment) => (
              <div key={comment.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-bold ${comment.authorId === currentDeviceId ? 'text-red-400' : 'text-slate-300'}`}>
                    {comment.authorId} {comment.authorId === currentDeviceId && '(Anda)'}
                  </span>
                  <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
                </div>
                <p className="text-xs text-slate-300">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};