import React from 'react';
import { X, Clock, BrainCircuit, ShieldAlert } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { ValidationMeter } from '@/components/report/ValidationMeter';

export const ReportDrawer: React.FC = () => {
  const { reports, selectedReportId, setSelectedReportId } = useMapStore();
  
  const report = reports.find(r => r.id === selectedReportId);
  const isOpen = !!report;

  if (!isOpen || !report) return null;

  return (
    <div className={`fixed inset-y-0 right-0 z-[2000] w-full md:w-[450px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-700 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full uppercase tracking-wider">
            {report.category}
          </span>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Baru saja
          </span>
        </div>
        <button 
          onClick={() => setSelectedReportId(null)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Title & Desc */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">
            {report.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* AI Summary Card (Glassmorphism + Blue Tint) */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50">
          <div className="absolute -top-3 left-4 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300">
            <BrainCircuit className="w-3 h-3" />
            RINGKASAN AI
          </div>
          <p className="text-sm text-blue-900 dark:text-blue-200 mt-2 font-medium">
            "Kondisi api membesar dengan cepat karena angin kencang. Warga sedang melakukan evakuasi mandiri, namun pemadam kebakaran belum tiba di lokasi."
          </p>
        </div>

        {/* Validation Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Verifikasi Massa
          </h3>
          <ValidationMeter validVotes={report.validVotes} invalidVotes={report.invalidVotes} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm transition-colors">
              Valid (Sesuai)
            </button>
            <button className="py-2 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 font-bold text-sm transition-colors">
              Tidak Valid (Hoaks)
            </button>
          </div>
        </div>

        {/* Timeline Kejadian (Mock) */}
        <div>
          <h3 className="text-sm font-bold mb-4">Linimasa Kejadian</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {/* Timeline Item 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-red-500 text-slate-500 shadow shrink-0 z-10" />
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 ml-4 md:ml-0">
                <span className="font-bold text-xs text-red-500">14:32 WIB</span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Laporan Dibuat</p>
              </div>
            </div>
            {/* Timeline Item 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-blue-500 text-slate-500 shadow shrink-0 z-10" />
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 ml-4 md:ml-0">
                <span className="font-bold text-xs text-blue-500">14:45 WIB</span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Diverifikasi Warga (15 Valid)</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};