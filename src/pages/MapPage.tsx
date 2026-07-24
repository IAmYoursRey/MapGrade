import React from 'react';
import { AlertTriangle, Layers } from 'lucide-react';
import { MapContainer } from '@/features/map/MapContainer';
import { CategoryFilterPills } from '@/components/map/CategoryFilterPills';
import { useMapStore } from '@/store/useMapStore';

export const MapPage: React.FC = () => {
  const { activeLayer, setActiveLayer } = useMapStore();

  const toggleMapLayer = () => {
    const nextLayer = activeLayer === 'DARK' ? 'SATELLITE' 
                    : activeLayer === 'SATELLITE' ? 'STREET' 
                    : 'DARK';
    setActiveLayer(nextLayer);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      {/* Inti Peta Leaflet */}
      <MapContainer />

      {/* Panel Navigasi Mengambang (Kiri) */}
      <CategoryFilterPills />

      {/* Layer Toggle (Kanan Bawah) */}
      <button 
        onClick={toggleMapLayer}
        className="absolute bottom-6 right-6 z-[1000] flex items-center justify-center p-3 rounded-xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 shadow-xl text-slate-800 dark:text-white hover:bg-white/30 transition-all hover:scale-105"
        title="Ubah Mode Peta"
      >
        <Layers className="w-6 h-6" />
      </button>

      {/* Tombol Lapor Darurat (Tengah Bawah) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <button 
          className="group relative flex items-center gap-3 px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-[0_0_20px_rgba(229,57,53,0.5)] transition-all hover:scale-105 active:scale-95 border-2 border-red-400/50"
        >
          <AlertTriangle className="w-6 h-6 group-hover:animate-pulse" />
          LAPOR DARURAT
          
          {/* Efek ping animasi di belakang tombol */}
          <span className="absolute w-full h-full rounded-full bg-red-500 opacity-20 group-hover:animate-ping -z-10" />
        </button>
      </div>

      {/* TODO Tahap Berikutnya: Letakkan komponen <ReportDrawer /> di sini saat sebuah titik diklik */}
    </div>
  );
};