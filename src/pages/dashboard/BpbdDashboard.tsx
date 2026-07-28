import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapStore, ReportStatus, Report } from '@/store/useMapStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ReportDrawer } from '@/features/report/ReportDrawer';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  RefreshCw,
  FileText,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
  AlertCircle,
  Trash2,
  MapPin,
  Plus
} from 'lucide-react';

export const BpbdDashboard: React.FC = () => {
  const navigate = useNavigate();

  const {
    reports = [],
    updateReportStatus,
    deleteReport,
    setSelectedReport,
    setSelectedReportId,
    setIsDrawerOpen,
    setIsFormOpen,
  } = useMapStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_validated'>('newest');

  const totalReports = reports ? reports.length : 0;
  const unverifiedCount = reports ? reports.filter((r) => r.status === 'UNVERIFIED').length : 0;
  const needsReviewCount = reports ? reports.filter((r) => r.status === 'NEEDS_REVIEW').length : 0;
  const inProgressCount = reports ? reports.filter((r) => r.status === 'IN_PROGRESS').length : 0;
  const resolvedCount = reports ? reports.filter((r) => r.status === 'RESOLVED').length : 0;

  const filteredReports = useMemo(() => {
    return (reports || [])
      .filter((report) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          report.title?.toLowerCase().includes(query) ||
          report.description?.toLowerCase().includes(query) ||
          report.category?.toLowerCase().includes(query);

        const matchesCategory =
          selectedCategory === 'ALL' ||
          report.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesStatus =
          selectedStatusFilter === 'ALL' || report.status === selectedStatusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (sortBy === 'most_validated') {
          return (b.validationsCount || 0) - (a.validationsCount || 0);
        }
        return 0;
      });
  }, [reports, searchTerm, selectedCategory, selectedStatusFilter, sortBy]);

  const handleViewReportDetail = (report: Report) => {
    if (typeof setSelectedReport === 'function') {
      setSelectedReport(report);
    } else if (typeof setSelectedReportId === 'function') {
      setSelectedReportId(report.id);
    }
    if (typeof setIsDrawerOpen === 'function') {
      setIsDrawerOpen(true);
    }
  };

  const handleDeleteReport = (reportId: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus laporan "${title}"? Langkah ini akan menghapus laporan hoax / informasi palsu secara permanen.`)) {
      deleteReport(reportId);
    }
  };

  const handleCreateManualReport = () => {
    setIsFormOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatusFilter('ALL');
    setSortBy('newest');
  };

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-600 cursor-pointer active:scale-95 shadow-sm flex items-center justify-center shrink-0"
            title="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 tracking-wider">
                Sistem Pemantauan Utama
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
              <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
              Pusat Komando & Verifikasi BPBD
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              Monitoring real-time, hapus laporan hoax/buzzer, dan tandai titik lokasi bencana
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCreateManualReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tandai Bencana Baru</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-600 transition-all cursor-pointer active:scale-95"
          >
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Peta Utama</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-600 transition-all cursor-pointer active:scale-95"
            title="Segarkan Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </nav>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <article className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <figure className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </figure>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Total Laporan</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalReports}</h3>
          </div>
        </article>

        <article className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <figure className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </figure>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Belum Verifikasi</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{unverifiedCount}</h3>
          </div>
        </article>

        <article className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <figure className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </figure>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Perlu Tinjauan</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{needsReviewCount}</h3>
          </div>
        </article>

        <article className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <figure className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <RefreshCw className="w-6 h-6" />
          </figure>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Sedang Ditangani</p>
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{inProgressCount}</h3>
          </div>
        </article>

        <article className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <figure className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </figure>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Tuntas Teratasi</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</h3>
          </div>
        </article>
      </section>

      <section className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, kata kunci, atau lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <nav className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 sm:flex-none">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Banjir">🌊 Banjir</option>
                <option value="Longsor">⛰️ Tanah Longsor</option>
                <option value="Kebakaran">🔥 Kebakaran</option>
                <option value="Gempa">🌋 Gempa Bumi</option>
                <option value="Puting Beliung">🌪️ Puting Beliung</option>
                <option value="Lainnya">⚠️ Lainnya</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 sm:flex-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="UNVERIFIED">🔴 Belum Diverifikasi</option>
                <option value="NEEDS_REVIEW">🟡 Perlu Peninjauan</option>
                <option value="IN_PROGRESS">🔵 Sedang Ditangani</option>
                <option value="RESOLVED">🟢 Selesai Teratasi</option>
                <option value="ARCHIVED">⚪ Diarsip</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="newest">📅 Terbaru</option>
                <option value="oldest">⏳ Terlama</option>
                <option value="most_validated">👍 Validasi Terbanyak</option>
              </select>
            </div>

            {(searchTerm || selectedCategory !== 'ALL' || selectedStatusFilter !== 'ALL' || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </nav>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Daftar Laporan Bencana
            </span>
            <span className="px-2 py-0.5 text-[11px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
              {filteredReports.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Menampilkan {filteredReports.length} dari {totalReports} total laporan
          </span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Informasi Bencana</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Validasi Komunitas</th>
                <th className="p-4">Status Terkini</th>
                <th className="p-4">Status Penanganan</th>
                <th className="p-4 text-center">Kelola Laporan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 opacity-30" />
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Tidak ada laporan bencana yang ditemukan.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                        <span>{report.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {report.createdAt || 'Baru saja'}
                        </span>
                        {report.damage && (
                          <span className="text-red-500 dark:text-red-400 font-medium truncate">
                            Dampak: {report.damage}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 inline-block">
                        {report.category}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{report.validationsCount || 0}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-200 dark:border-red-800">
                          <ThumbsDown className="w-3 h-3" />
                          <span>{report.invalidationsCount || 0}</span>
                        </span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <select
                        value={report.status}
                        onChange={(e) => updateReportStatus(report.id, e.target.value as ReportStatus)}
                        className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-slate-200 cursor-pointer shadow-sm transition-all"
                      >
                        <option value="UNVERIFIED">🔴 Belum Diverifikasi</option>
                        <option value="NEEDS_REVIEW">🟡 Perlu Peninjauan</option>
                        <option value="IN_PROGRESS">🔵 Sedang Ditangani</option>
                        <option value="RESOLVED">🟢 Selesai Teratasi</option>
                        <option value="ARCHIVED">⚪ Arsipkan Laporan</option>
                      </select>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewReportDetail(report)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1.5 text-xs font-bold shadow-sm"
                          title="Lihat detail lengkap laporan"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReport(report.id, report.title)}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-xl transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1.5 text-xs font-bold border border-red-200 dark:border-red-800/50 shadow-sm"
                          title="Hapus laporan hoax / informasi palsu"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus / Hoax</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <ReportDrawer />
    </main>
  );
};