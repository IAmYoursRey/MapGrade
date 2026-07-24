import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/useMapStore';
import { Info } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const { reports } = useMapStore();

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

    // Render "Mock" Heatmap menggunakan Lingkaran bergradasi (CircleMarkers)
    // Di produksi nyata, akan menggunakan leaflet.heat plugin
    reports.forEach((report) => {
      // Radius disimulasikan dari besarnya dukungan/validasi (contoh logika)
      const radius = 20000 + (report.validVotes * 1000); 
      
      L.circle([report.latitude, report.longitude], {
        color: 'transparent',
        fillColor: report.status === 'NEEDS_REVIEW' ? '#f59e0b' : '#e53935', // Kuning (Hoaks) atau Merah (Valid)
        fillOpacity: 0.4,
        radius: radius,
      }).addTo(leafletMap.current!);
    });

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, [reports]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Analisis Zona Kerapatan Bencana (Heatmap)</h1>
          <p className="text-slate-500 text-sm mt-1">Data historis dan real-time dari distribusi titik darurat.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold">
          <Info className="w-4 h-4" />
          Update setiap 5 menit (PostGIS ST_Cluster)
        </div>
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