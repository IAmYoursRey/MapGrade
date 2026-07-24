import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AlertTriangle, Clock, Eye, CheckCircle2 } from 'lucide-react';
import { ReportStatus } from '@/types';

export const BpbdDashboard: React.FC = () => {
  const { reports } = useMapStore();
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');

  const filteredReports = filter === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === filter);

  // Mock statistik
  const stats = [
    { label: 'Laporan Masuk', value: reports.length, color: 'text-blue-600' },
    { label: 'Perlu Investigasi', value: reports.filter(r => r.status === 'NEEDS_REVIEW').length, color: 'text-amber-600' },
    { label: 'Sedang Ditangani', value: reports.filter(r => r.status === 'IN_PROGRESS').length, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              <h3 className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${stat.color.replace('text', 'bg').replace('600', '100')} dark:bg-opacity-10`}>
              <AlertTriangle className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold">Daftar Laporan Terkini</h2>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="UNVERIFIED">Belum Diverifikasi</option>
            <option value="VERIFIED_CROWD">Diverifikasi Warga</option>
            <option value="NEEDS_REVIEW">Perlu Investigasi</option>
            <option value="IN_PROGRESS">Ditangani BPBD</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-bold">ID / Judul</th>
                <th className="p-4 font-bold">Kategori</th>
                <th className="p-4 font-bold">Status Verifikasi</th>
                <th className="p-4 font-bold">Rasio Warga</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white">{report.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleTimeString()} WIB
                    </p>
                  </td>
                  <td className="p-4 font-semibold">{report.category}</td>
                  <td className="p-4"><StatusBadge status={report.status} /></td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-emerald-600">{report.validVotes} Valid</div>
                    <div className="text-xs font-bold text-red-600">{report.invalidVotes} Invalid</div>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors" title="Lihat Detail Peta">
                      <Eye className="w-4 h-4" />
                    </button>
                    {report.status !== 'RESOLVED' && (
                      <button className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors" title="Tandai Selesai">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada laporan yang sesuai dengan filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};