import React, { useState } from 'react';
import { useMapStore, Report, ReportStatus } from '@/store/useMapStore';
import { useAuthStore, hasMapMarkPermission } from '@/store/useAuthStore';
import { getDeviceId } from '@/utils/deviceId';
import { ValidationMeter } from '@/components/report/ValidationMeter';
import { 
  X, MapPin, ThumbsUp, ThumbsDown, MessageSquare, Bot, Send, 
  ShieldCheck, Image as ImageIcon, Trash2, Edit, Clock, Camera
} from 'lucide-react';

export const ReportDrawer: React.FC = () => {
  const store = useMapStore();
  const { user } = useAuthStore();
  const canEdit = hasMapMarkPermission(user);

  const selectedReport = store.selectedReport;
  const isDrawerOpen = store.isDrawerOpen;
  const setIsDrawerOpen = store.setIsDrawerOpen;
  const addComment = store.addComment;
  const handleValidation = store.handleValidation;
  const updateReport = store.updateReport;

  const [commentInput, setCommentInput] = useState('');
  const [commentPhoto, setCommentPhoto] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('BANJIR');
  const [editDescription, setEditDescription] = useState('');
  const [editCasualties, setEditCasualties] = useState('');
  const [editDamage, setEditDamage] = useState('');
  const [editCreatedAt, setEditCreatedAt] = useState('');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);

  const currentDeviceId = getDeviceId();

  if (!isDrawerOpen || !selectedReport) return null;

  const safeValidVotes = selectedReport.validationsCount || 0;
  const safeInvalidVotes = selectedReport.invalidationsCount || 0;
  
  const hasVotedValid = selectedReport.votedBy?.includes(currentDeviceId) || false;
  const hasVotedInvalid = selectedReport.invalidatedBy?.includes(currentDeviceId) || false;

  const startEditing = () => {
    setEditTitle(selectedReport.title || '');
    setEditCategory(selectedReport.category || 'BANJIR');
    setEditDescription(selectedReport.description || '');
    setEditCasualties(String(selectedReport.casualties || 0));
    setEditDamage(selectedReport.damage || '');
    setEditCreatedAt(selectedReport.createdAt || '');
    setEditPhotos(selectedReport.photos || []);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    updateReport(selectedReport.id, {
      title: editTitle.trim(),
      category: editCategory,
      description: editDescription.trim(),
      casualties: parseInt(editCasualties) || 0,
      damage: editDamage.trim(),
      createdAt: editCreatedAt.trim(),
      photos: editPhotos
    });

    setIsEditing(false);
  };

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

  const handleEditPhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!commentInput.trim() && !commentPhoto) || typeof addComment !== 'function') return;
    addComment(selectedReport.id, commentInput.trim(), commentPhoto || undefined);
    setCommentInput('');
    setCommentPhoto(null);
  };

  return (
    <aside className="absolute right-0 top-0 h-full w-full md:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-[2000] animate-in slide-in-from-right text-white">
      <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-bold text-white text-base md:text-lg truncate">{selectedReport.title || 'Detail Laporan'}</h2>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={startEditing}
              className="p-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-xl transition-all border border-amber-500/40 text-xs font-bold flex items-center gap-1 shrink-0"
              title="Edit Data Laporan (Dev/Admin)"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
          <button 
            onClick={() => setIsDrawerOpen && setIsDrawerOpen(false)} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        <article className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <MapPin className="w-4 h-4 text-red-500" />
              Lat: {selectedReport.latitude?.toFixed(4) || 0}, Lng: {selectedReport.longitude?.toFixed(4) || 0}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              {selectedReport.createdAt || 'Waktu tidak tersedia'}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            {selectedReport.description || 'Tidak ada deskripsi detail untuk laporan ini.'}
          </p>

          {selectedReport.photos && selectedReport.photos.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Foto Dokumentasi:</span>
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
        </article>

        <article className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-inner">
          <header className="flex items-center gap-2 text-xs mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="font-bold text-white">Verifikasi Warga (Crowd-Validation)</p>
              <p className="text-[10px] text-slate-400">ID Anda: <span className="text-slate-300 font-medium">{currentDeviceId}</span></p>
            </div>
          </header>

          <ValidationMeter validVotes={safeValidVotes} invalidVotes={safeInvalidVotes} />

          <nav className="grid grid-cols-2 gap-3 pt-2">
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
          </nav>
        </article>

        <article className="p-4 rounded-2xl bg-blue-900/10 border border-blue-900/30">
          <header className="flex items-center gap-2 mb-2 text-blue-400">
            <Bot className="w-5 h-5" />
            <span className="font-bold text-xs">Ringkasan AI & Respon Cepat</span>
          </header>
          <p className="text-xs text-blue-200/70 italic leading-relaxed">
            {selectedReport.aiSummary || 'AI sedang menganalisis tingkat risiko dan dampak di lokasi kejadian...'}
          </p>
        </article>

        <section className="space-y-4 pt-2">
          <header className="flex items-center gap-2 text-slate-300">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-sm">Tanggapan & Bukti Foto ({selectedReport.commentsCount || 0})</h3>
          </header>
          
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
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
              <figure className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                <img src={commentPhoto} alt="Preview Bukti" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCommentPhoto(null)}
                  className="absolute top-1 right-1 p-0.5 bg-red-600 rounded-full text-white"
                  title="Hapus foto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </figure>
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
        </section>
      </section>

      {isEditing && (
        <aside className="fixed inset-0 z-[2500] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <article className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <Edit className="w-4 h-4" />
                Edit Data Pelapor (Otoritas Dev/Admin)
              </h3>
              <button onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </header>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <fieldset className="space-y-1">
                <label className="font-bold text-slate-300">Judul Bencana</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-amber-500"
                />
              </fieldset>

              <fieldset className="space-y-1">
                <label className="font-bold text-slate-300">Kategori</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-amber-500 text-slate-200"
                >
                  <option value="BANJIR">🌊 Banjir</option>
                  <option value="LONGSOR">⛰️ Tanah Longsor</option>
                  <option value="GEMPA">🌍 Gempa Bumi</option>
                  <option value="KEBAKARAN">🔥 Kebakaran</option>
                  <option value="ANGIN_PUTING_BELIUNG">🌪️ Angin Puting Beliung</option>
                  <option value="TSUNAMI">🌊 Tsunami</option>
                  <option value="LAINNYA">⚠️ Lainnya</option>
                </select>
              </fieldset>

              <fieldset className="space-y-1">
                <label className="font-bold text-slate-300">Deskripsi / Kronologi</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-amber-500"
                />
              </fieldset>

              <div className="grid grid-cols-2 gap-2">
                <fieldset className="space-y-1">
                  <label className="font-bold text-slate-300">Waktu Terbuat / Timezone</label>
                  <input
                    type="text"
                    value={editCreatedAt}
                    onChange={(e) => setEditCreatedAt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-amber-500 font-mono text-[11px]"
                    placeholder="29 Jul 2026, 07:08 WIB"
                  />
                </fieldset>
                <fieldset className="space-y-1">
                  <label className="font-bold text-slate-300">Korban Terdampak</label>
                  <input
                    type="number"
                    value={editCasualties}
                    onChange={(e) => setEditCasualties(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-amber-500"
                  />
                </fieldset>
              </div>

              <fieldset className="space-y-1">
                <label className="font-bold text-slate-300">Dampak Kerusakan</label>
                <input
                  type="text"
                  value={editDamage}
                  onChange={(e) => setEditDamage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-amber-500"
                />
              </fieldset>

              <fieldset className="space-y-1.5">
                <label className="font-bold text-slate-300">Foto Dokumen Lapangan</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {editPhotos.map((p, idx) => (
                    <figure key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                      <img src={p} alt="Photo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditPhotos(editPhotos.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 rounded-full text-white"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </figure>
                  ))}
                  <label className="w-14 h-14 flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-lg cursor-pointer shrink-0">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-[9px] font-bold text-slate-300">+ Foto</span>
                    <input type="file" accept="image/*" multiple onChange={handleEditPhotoAdd} className="hidden" />
                  </label>
                </div>
              </fieldset>

              <footer className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-600/30"
                >
                  Simpan Perubahan
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}
    </aside>
  );
};