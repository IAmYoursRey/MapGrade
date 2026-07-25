import { ThumbsUp, ThumbsDown } from 'lucide-react';
// Kita panggil store dan alat pengenal device
import { useMapStore } from '../../store/useMapStore';
import { getDeviceId } from '../../utils/deviceId';

interface ValidationMeterProps {
  validVotes?: number;
  invalidVotes?: number;
}

export const ValidationMeter = ({ validVotes: initialValid, invalidVotes: initialInvalid }: ValidationMeterProps) => {
  // 1. Tarik laporan yang sedang dibuka dan fungsi validasinya dari Store
  const { selectedReport, handleValidation } = useMapStore();

  // 2. Gunakan data REAL-TIME dari store. Jika tidak ada, baru pakai angka bawaan.
  const reportId = selectedReport?.id;
  const validVotes = selectedReport?.validationsCount ?? initialValid ?? 0;
  const invalidVotes = selectedReport?.invalidationsCount ?? initialInvalid ?? 0;

  // 3. Cek apakah user kita sudah pernah menekan tombol ini (untuk efek warna menyala)
  const deviceId = getDeviceId();
  const hasVotedValid = selectedReport?.votedBy?.includes(deviceId);
  const hasVotedInvalid = selectedReport?.invalidatedBy?.includes(deviceId);

  // 4. Kalkulasi Persentase Bar
  const totalVotes = validVotes + invalidVotes;
  const validPercentage = totalVotes === 0 ? 50 : Math.round((validVotes / totalVotes) * 100);
  const invalidPercentage = totalVotes === 0 ? 50 : 100 - validPercentage;

  // 5. Eksekusi Tombol Valid / Hoaks
  const onValidClick = () => {
    if (!reportId) return;
    handleValidation(reportId, 'valid');
  };

  const onInvalidClick = () => {
    if (!reportId) return;
    handleValidation(reportId, 'invalid');
  };

  return (
    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
      
      {/* Header Stat & Tombol Aksi */}
      <div className="flex items-center justify-between text-xs">
        
        {/* TOMBOL VALID */}
        <button 
          onClick={onValidClick}
          disabled={!reportId}
          className={`flex items-center gap-1.5 font-bold p-1.5 rounded-lg transition-all active:scale-95 ${
            hasVotedValid 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasVotedValid ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
          <span>{validVotes} Valid</span>
        </button>

        {/* TOMBOL HOAKS */}
        <button 
          onClick={onInvalidClick}
          disabled={!reportId}
          className={`flex items-center gap-1.5 font-bold p-1.5 rounded-lg transition-all active:scale-95 ${
            hasVotedInvalid
              ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
              : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
          }`}
        >
          <span>{invalidVotes} Hoaks/Keliru</span>
          <ThumbsDown className={`w-4 h-4 ${hasVotedInvalid ? 'fill-red-600 dark:fill-red-400' : ''}`} />
        </button>

      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full bg-red-100 dark:bg-red-950/40 h-2 rounded-full overflow-hidden flex">
        <div 
          className="bg-emerald-500 h-full transition-all duration-500" 
          style={{ width: `${validPercentage}%` }}
        />
        <div 
          className="bg-red-500 h-full transition-all duration-500" 
          style={{ width: `${invalidPercentage}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
        <span>{validPercentage}% Memvalidasi</span>
        <span>{invalidPercentage}% Meragukan</span>
      </div>

    </div>
  );
};