import React from 'react';
import { ReportStatus } from '@/types';

export const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const configs: Record<ReportStatus, { bg: string; text: string; label: string }> = {
    UNVERIFIED: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', label: 'Belum Diverifikasi' },
    VERIFIED_CROWD: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Diverifikasi Warga' },
    NEEDS_REVIEW: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Perlu Investigasi (Hoaks?)' },
    IN_PROGRESS: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Ditangani BPBD' },
    RESOLVED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Selesai' },
    ARCHIVED: { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', label: 'Arsip' },
  };

  const config = configs[status];

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border border-current border-opacity-20 ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};