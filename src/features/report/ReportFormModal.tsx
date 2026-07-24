import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { getDeviceId } from '@/utils/deviceId';
import { MapPin, Camera, Video, AlertTriangle, X, Loader2 } from 'lucide-react';

export const CreateReportModal: React.FC = () => {
  const { isCreateModalOpen, setCreateModalOpen, addReport } = useMapStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('BANJIR');
  const [description, setDescription] = useState('');
  const [victimCount, setVictimCount] = useState('');
  
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  if (!isCreateModalOpen) return null;

  // Handler GPS Otomatis
  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          // Fallback jika GPS ditolak/offline: Lokasi Surabaya pusat
          setCoords({ lat: -7.2575, lng: 112.7521 });
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setCoords({ lat: -7.2575, lng: 112.7521 });
      setIsLocating(false);
    }
  };

  // Preview Foto
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  // Preview Video
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Gunakan posisi terdeteksi atau default lokasi
    const finalLat = coords ? coords.lat : -7.2575 + (Math.random() - 0.5) * 0.05;
    const finalLng = coords ? coords.lng : 112.7521 + (Math.random() - 0.5) * 0.05;

    addReport({
      title,
      category,
      description: description || 'Tidak ada deskripsi tambahan.',
      latitude: finalLat,
      longitude: finalLng,
      reporterName: getDeviceId(),
      mediaUrl: mediaPreview || undefined,
      videoUrl: videoPreview || undefined,
      victimCount: victimCount || undefined
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setMediaPreview(null);
    setVideoPreview(null);
    setCoords(null);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Lapor Darurat Bencana</h2>
              <p className="text-xs text-red-100">Identitas: <span className="font-mono font-bold">{getDeviceId()}</span></p>
            </div>
          </div>
          <button onClick={() => setCreateModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Lokasi GPS Auto */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-red-500" />
                {coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Lokasi Presisi GPS'}
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl hover:bg-red-200 transition-all flex items-center gap-1"
              >
                {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Kunci GPS Saya'}
              </button>
            </div>
          </div>

          {/* Judul Kejadian (Wajib) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Judul Bencana / Kejadian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pohon Tumbang / Banjir Semata Kaki"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Kategori Kejadian</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="BANJIR">🌊 Banjir / Genangan</option>
              <option value="POHON_TUMBANG">🌳 Pohon Tumbang</option>
              <option value="KEBAKARAN">🔥 Kebakaran</option>
              <option value="LONGSOR">⛰️ Tanah Longsor</option>
              <option value="GEMPA">🫨 Gempa Bumi</option>
              <option value="LAINNYA">🚨 Darurat Lainnya</option>
            </select>
          </div>

          {/* Opsional Kronologi & Korban */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Estimasi Korban (Opsional)</label>
              <input
                type="text"
                placeholder="Misal: 2 Orang Luka"
                value={victimCount}
                onChange={(e) => setVictimCount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Deskripsi / Kronologi</label>
              <input
                type="text"
                placeholder="Detail situasi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>

          {/* Upload Foto & Video */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-red-500 text-slate-500 text-xs font-bold">
                <Camera className="w-4 h-4 text-red-500" />
                Upload Foto
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
            <div>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-red-500 text-slate-500 text-xs font-bold">
                <Video className="w-4 h-4 text-blue-500" />
                Upload Video
                <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Media Previews */}
          {mediaPreview && (
            <div className="relative rounded-xl overflow-hidden max-h-40 border border-slate-300">
              <img src={mediaPreview} alt="Preview Foto" className="w-full h-full object-cover" />
            </div>
          )}
          {videoPreview && (
            <div className="rounded-xl overflow-hidden max-h-40 border border-slate-300">
              <video src={videoPreview} controls className="w-full h-full object-cover" />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 text-base mt-4"
          >
            KIRIM LAPORAN SEKARANG
          </button>
        </form>
      </div>
    </div>
  );
};