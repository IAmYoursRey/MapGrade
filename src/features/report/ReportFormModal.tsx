import React, { useState, useEffect } from 'react';
import { useMapStore, Report } from '@/store/useMapStore';
import { 
  X, 
  MapPin, 
  Camera, 
  Video, 
  AlertTriangle, 
  Loader2, 
  Upload, 
  Trash2 
} from 'lucide-react';

export const ReportFormModal: React.FC = () => {
  const { isFormOpen, setIsFormOpen, addReport, manualCoords } = useMapStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Report['category']>('BANJIR');
  const [description, setDescription] = useState('');
  const [casualties, setCasualties] = useState('');
  const [damage, setDamage] = useState('');
  const [contact, setContact] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'manual'>('idle');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isFormOpen) {
      if (manualCoords) {
        setCoords(manualCoords);
        setGpsStatus('manual');
      } else {
        requestLocation();
      }
    } else {
      resetForm();
    }
  }, [isFormOpen, manualCoords]);

  const requestLocation = () => {
    setGpsStatus('loading');
    setGpsErrorMsg('');

    if (!navigator.geolocation) {
      setGpsStatus('denied');
      setGpsErrorMsg('Browser Anda tidak mendukung fitur Geolocation GPS.');
      setCoords({ lat: -7.2575, lng: 112.7521 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsStatus('success');
      },
      (error) => {
        setGpsStatus('denied');
        setCoords({ lat: -7.2575, lng: 112.7521 }); 
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsErrorMsg('Izin GPS ditolak. Menggunakan lokasi default peta.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsErrorMsg('Sinyal GPS tidak ditemukan.');
            break;
          default:
            setGpsErrorMsg('Gagal mengambil lokasi GPS.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(30);

    const fileList = Array.from(files);
    let loadedCount = 0;
    const base64Photos: string[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          base64Photos.push(event.target.result as string);
        }
        loadedCount += 1;
        setUploadProgress(Math.round((loadedCount / fileList.length) * 100));
        if (loadedCount === fileList.length) {
          setIsUploading(false);
          setPhotos((prev) => [...prev, ...base64Photos]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(30);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsUploading(false);

          const newVideos = Array.from(files).map((file) => URL.createObjectURL(file));
          setVideos((prevVideos) => [...prevVideos, ...newVideos]);
          return 0;
        }
        return prev + 35;
      });
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Judul bencana wajib diisi!');
      return;
    }

    const newReport: Partial<Report> = {
      id: `report-${Date.now()}`,
      title: title.trim(),
      category: category || 'LAINNYA',
      description: description.trim() || 'Tidak ada deskripsi tambahan.',
      latitude: coords?.lat || -7.2575,
      longitude: coords?.lng || 112.7521,
      status: 'UNVERIFIED', 
      createdAt: new Date().toISOString(),
      photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800'],
      videos,
      casualties: casualties ? parseInt(casualties) : 0,
      damage: damage || '-',
      contactPhone: contact || '-',
      upvotes: 1,
      validationsCount: 1,
      commentsCount: 0,
    };

    if (addReport) {
      addReport(newReport as Report);
    }

    alert('Laporan bencana berhasil dikirim!');
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('BANJIR');
    setDescription('');
    setCasualties('');
    setDamage('');
    setContact('');
    setPhotos([]);
    setVideos([]);
    setGpsStatus('idle');
  };

  if (!isFormOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white p-6 space-y-6">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <figure className="p-2.5 bg-red-500/20 text-red-500 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </figure>
            <div>
              <h2 className="text-lg font-bold">Lapor Bencana Darurat</h2>
              <p className="text-xs text-slate-400">Isi informasi bencana dengan cepat dan akurat</p>
            </div>
          </div>
          <button 
            onClick={() => setIsFormOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <section className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className={`w-5 h-5 ${gpsStatus === 'success' || gpsStatus === 'manual' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <p className="text-xs font-bold">
                {gpsStatus === 'loading' && 'Mendeteksi Lokasi GPS...'}
                {gpsStatus === 'success' && 'Lokasi GPS Berhasil Dideteksi'}
                {gpsStatus === 'manual' && 'Lokasi Ditandai Manual di Peta'}
                {gpsStatus === 'denied' && 'GPS Terkendala (Menggunakan Lokasi Default)'}
              </p>
              {coords && (
                <p className="text-[10px] text-slate-400 font-mono">
                  Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                </p>
              )}
              {gpsErrorMsg && <p className="text-[10px] text-red-400">{gpsErrorMsg}</p>}
            </div>
          </div>
          {gpsStatus === 'loading' ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : (
            <button
              type="button"
              onClick={requestLocation}
              className="px-3 py-1.5 text-[11px] font-bold bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
            >
              Deteksi GPS
            </button>
          )}
        </section>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Judul Kejadian <span className="text-red-500">* (Wajib)</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Banjir Bandang Luapan Sungai Citarum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500"
            />
          </fieldset>

          <fieldset className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Jenis Bencana (Opsional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Report['category'])}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-red-500 transition-all text-slate-200"
            >
              <option value="BANJIR">🌊 Banjir</option>
              <option value="LONGSOR">⛰️ Tanah Longsor</option>
              <option value="GEMPA">🫨 Gempa Bumi</option>
              <option value="KEBAKARAN">🔥 Kebakaran</option>
              <option value="ANGIN_PUTING_BELIUNG">🌪️ Angin Puting Beliung</option>
              <option value="TSUNAMI">🌊 Tsunami</option>
              <option value="LAINNYA">⚠️ Bencana Lainnya</option>
            </select>
          </fieldset>

          <fieldset className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Kronologi / Keterangan Tambahan (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan singkat kronologi kejadian, kebutuhan mendesak, atau jalur evakuasi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500"
            />
          </fieldset>

          <section className="grid grid-cols-2 gap-3">
            <fieldset className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Estimasi Korban (Opsional)
              </label>
              <input
                type="number"
                placeholder="0 jiwa"
                value={casualties}
                onChange={(e) => setCasualties(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500"
              />
            </fieldset>
            <fieldset className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Dampak Kerusakan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: 5 Rumah Rusak Berat"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500"
              />
            </fieldset>
          </section>

          <section className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Dokumentasi Foto / Video (Opsional)
            </label>
            
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-2xl cursor-pointer transition-all text-xs font-bold text-slate-300">
                <Camera className="w-4 h-4 text-red-400" />
                <span>+ Foto Galeri/Kamera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
              </label>

              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-2xl cursor-pointer transition-all text-xs font-bold text-slate-300">
                <Video className="w-4 h-4 text-blue-400" />
                <span>+ Video Recording</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {isUploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Mengunggah Media...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {photos.map((src, index) => (
                  <figure key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 p-0.5 bg-red-600 rounded-full text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </figure>
                ))}
              </div>
            )}
          </section>

          <fieldset className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Nomor Telepon / WhatsApp (Opsional)
            </label>
            <input
              type="tel"
              placeholder="081234567890 (Untuk konfirmasi tim lapangan)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500"
            />
          </fieldset>

          <footer className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold text-xs text-slate-300 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-2xl font-bold text-xs text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Kirim Laporan Bencana
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};