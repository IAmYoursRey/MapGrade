import React, { useState } from 'react';
import { useMapStore, ReportStatus } from '@/store/useMapStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export const BpbdDashboard: React.FC = () => {
  const { reports, updateReportStatus } = useMapStore();
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');

  const filteredReports = filter === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === filter);

  // Dynamic Reactive Stats
  const stats = [
    { label: 'Total Laporan Masuk', value: reports.length, color: 'text-blue-600' },
    { label: 'Perlu Investigasi', value: reports.filter(r => r.status === 'UNVERIFIED' || r.status === 'NEEDS_REVIEW').length, color: 'text-amber-600' },
    { label: 'Sedang Ditangani', value: reports.filter(r => r.status === 'IN_PROGRESS').length, color: 'text-purple-600' },
    { label: 'Selesai Teratasi', value: reports.filter(r => r.status === 'RESOLVED').length, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">{stat.label}</p>
              <h3 className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50`}>
              <AlertTriangle className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Management */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold">Pusat Kendali Laporan Warga</h2>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
          >
            <option value="ALL">Semua Status</option>
            <option value="UNVERIFIED">Belum Diverifikasi</option>
            <option value="IN_PROGRESS">Sedang Ditangani</option>
            <option value="RESOLVED">Selesai</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-bold">Bencana / Pelapor</th>
                <th className="p-4 font-bold">Kategori</th>
                <th className="p-4 font-bold">Status Saat Ini</th>
                <th className="p-4 font-bold text-center">Ubah Status Realtime</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white">{report.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {report.reporterName} • {new Date(report.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-xs uppercase text-slate-600 dark:text-slate-400">{report.category}</td>
                  <td className="p-4"><StatusBadge status={report.status} /></td>
                  <td className="p-4 text-center">
                    <select
                      value={report.status}
                      onChange={(e) => updateReportStatus(report.id, e.target.value as ReportStatus)}
                      className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-red-500"
                    >
                      <option value="UNVERIFIED">🔴 Belum Diverifikasi</option>
                      <option value="IN_PROGRESS">🔵 Tangani Bencana</option>
                      <option value="RESOLVED">🟢 Tandai Selesai</option>
                      <option value="ARCHIVED">⚫ Arsipkan</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};