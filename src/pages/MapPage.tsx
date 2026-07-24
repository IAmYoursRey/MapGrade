import React from 'react';
import { InteractiveMap } from '@/features/map/InteractiveMap';
import { ReportFormModal } from '@/features/report/ReportFormModal';
import { ReportDrawer } from '@/features/report/ReportDrawer';
import { useMapStore } from '@/store/useMapStore';
import { Plus } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { setIsFormOpen } = useMapStore();

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      
      {/* Peta Utama */}
      <InteractiveMap />

      {/* Tombol Lapor Bencana */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-8 z-[1500] px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-black text-sm shadow-2xl shadow-red-600/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
        <span>LAPOR BENCANA</span>
      </button>

      {/* Modal & Drawer */}
      <ReportFormModal />
      <ReportDrawer />

    </div>
  );
};

export default MapPage;