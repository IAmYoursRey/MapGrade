import React, { useState } from 'react';
import { X, UploadCloud, AlertTriangle, MapPin, Loader2 } from 'lucide-react';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulasi upload dan request API
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // Di sini idealnya memanggil toast success & menambahkan report ke map store
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-red-600 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Lapor Darurat Baru
          </h2>
          <button onClick={onClose} className="text-red-200 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Lokasi Auto-detect (Mock) */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Lokasi Terdeteksi</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">-7.952, 112.614 (Akurasi: Tinggi)</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kategori Bencana</label>
            <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 outline-none text-sm">
              <option value="">Pilih Kategori...</option>
              <option value="Kebakaran">Kebakaran</option>
              <option value="Banjir">Banjir</option>
              <option value="Gempa">Gempa Bumi</option>
              <option value="Longsor">Tanah Longsor</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Deskripsi Singkat</label>
            <textarea 
              required
              rows={3} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
              placeholder="Jelaskan apa yang terjadi dan bantuan apa yang dibutuhkan..."
            />
          </div>

          {/* Image Upload Box */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-red-500 transition-colors mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Unggah Foto Kejadian</p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/30 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};