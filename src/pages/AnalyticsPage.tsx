import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/useMapStore';
import { Info, ArrowLeft } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  // 1. Hook navigasi dari React Router
  const navigate = useNavigate();
  
  // 2. Ambil state untuk membuka laci (drawer) laporan dari store
  const { reports, setSelectedReport, setIsDrawerOpen } = useMapStore();

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Mode Malam/CartoDB untuk kontras heatmap
    leafletMap.current = L.map(mapRef.current, {
      center: [-0.7893, 113.9213], // Tengah Indonesia
      zoom: 5,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & GoSiaga',
    }).addTo(leafletMap.current);

    reports.forEach((report) => {
        const safeValidations = report.validationsCount || 0;
        const radius = 20000 + (safeValidations * 1000); 
        
        if (typeof report.latitude === 'number' && typeof report.longitude === 'number') {
          // 3. Simpan elemen lingkaran ke dalam variabel 'circle'
          const circle = L.circle([report.latitude, report.longitude], { 
            color: 'transparent',
            fillColor: report.status === 'NEEDS_REVIEW' ? '#f59e0b' : '#e53935', 
            fillOpacity: 0.4,
            radius: radius,
          }).addTo(leafletMap.current!);

          // 4. Tambahkan aksi Klik pada lingkaran
          circle.on('click', () => {
             // Saat diklik: Set data laporan aktif, lalu buka laci/drawer verifikasi
             if (setSelectedReport) setSelectedReport(report);
             if (setIsDrawerOpen) setIsDrawerOpen(true);
          });
        }
      });

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, [reports, setSelectedReport, setIsDrawerOpen]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        
        {/* 5. BAGIAN HEADER DIPERBARUI: Menambahkan Tombol Kembali & Icon ArrowLeft */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm border border-slate-700"
            title="Kembali ke Halaman Sebelumnya"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Analisis Zona Kerapatan Bencana</h1>
            <p className="text-slate-500 text-sm mt-1">Data historis dan real-time dari distribusi titik darurat.</p>
          </div>
        </div>
        
        <button 
          onClick={() => alert('Sistem: Memeriksa laporan terbaru dan menyinkronkan data Heatmap...')}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shadow-sm active:scale-95"
        >
          <Info className="w-4 h-4 animate-pulse" />
          Update setiap 5 menit (Klik Segarkan)
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative">
        <div ref={mapRef} className="w-full h-full bg-slate-900 z-0" />
        
        {/* Heatmap Legend */}
        <div className="absolute bottom-6 right-6 z-[1000] p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Tingkat Kerawanan</h4>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-4 h-4 rounded-full bg-red-500 opacity-60"></span>
            <span className="text-sm font-semibold">Krisis Terverifikasi</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-amber-500 opacity-60"></span>
            <span className="text-sm font-semibold">Indikasi Hoaks / Perlu Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};