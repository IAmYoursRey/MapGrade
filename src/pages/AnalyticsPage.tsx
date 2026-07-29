import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore, ReportStatus } from '@/store/useMapStore';
import { NotificationDropdown } from '@/components/common/NotificationDropdown';
import { setupMapLayers } from '@/features/map/setupMapLayers';
import { ReportDrawer } from '@/features/report/ReportDrawer';
import {
  Info, ArrowLeft, Activity, Users, BarChart2, Flame,
  CheckCircle2, Clock, AlertTriangle, XCircle, MapPin, Shield,
  ChevronRight, Filter, Globe
} from 'lucide-react';

const DARK_MAP_STYLE: any = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  UNVERIFIED:   { label: 'Belum Terverifikasi', color: 'text-red-400',     bg: 'bg-red-950/40',     border: 'border-red-800/50',     icon: <XCircle className="w-3.5 h-3.5" /> },
  NEEDS_REVIEW: { label: 'Butuh Tinjauan',      color: 'text-amber-400',   bg: 'bg-amber-950/40',   border: 'border-amber-800/50',   icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  IN_PROGRESS:  { label: 'Sedang Diproses',     color: 'text-blue-400',    bg: 'bg-blue-950/40',    border: 'border-blue-800/50',    icon: <Clock className="w-3.5 h-3.5" /> },
  RESOLVED:     { label: 'Selesai Ditangani',   color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ARCHIVED:     { label: 'Diarsipkan',           color: 'text-slate-400',   bg: 'bg-slate-800/60',   border: 'border-slate-700/50',   icon: <Shield className="w-3.5 h-3.5" /> },
};

const CATEGORY_ICONS: Record<string, string> = {
  BANJIR: '🌊', LONGSOR: '⛰️', GEMPA: '🌍', KEBAKARAN: '🔥',
  TSUNAMI: '🌊', ANGIN_PUTING_BELIUNG: '🌪️', LAINNYA: '⚠️',
};

export const AnalyticsPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const onReportClickRef = useRef<(r: any) => void>(() => {});

  const navigate = useNavigate();
  const { reports = [], setSelectedReport, setIsDrawerOpen, updateReportStatus } = useMapStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showStatsPanel, setShowStatsPanel] = useState<boolean>(true);
  const [showOfficerPanel, setShowOfficerPanel] = useState<boolean>(false);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const analyticsData = useMemo(() => {
    const total = reports.length;
    const unverified  = reports.filter(r => r.status === 'UNVERIFIED').length;
    const needsReview = reports.filter(r => r.status === 'NEEDS_REVIEW').length;
    const critical    = unverified + needsReview;
    const inProgress  = reports.filter(r => r.status === 'IN_PROGRESS').length;
    const resolved    = reports.filter(r => r.status === 'RESOLVED').length;
    const totalCasualties  = reports.reduce((s, r) => s + (r.casualties || 0), 0);
    const totalValidations = reports.reduce((s, r) => s + (r.validationsCount || 0), 0);

    const categoryCounts: Record<string, number> = {};
    reports.forEach(r => {
      const cat = r.category || 'LAINNYA';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const categoriesList = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    return { total, critical, unverified, needsReview, inProgress, resolved, totalCasualties, totalValidations, categoriesList };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const okCat    = selectedCategory === 'ALL' || r.category === selectedCategory;
      const okStatus = selectedStatus   === 'ALL' || r.status   === selectedStatus;
      return okCat && okStatus;
    });
  }, [reports, selectedCategory, selectedStatus]);

  const flyToReport = (report: any) => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({
      center: [report.longitude, report.latitude],
      zoom: 15, duration: 800
    });
    setSelectedReport(report);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = async (reportId: string, status: ReportStatus) => {
    setUpdatingId(reportId);
    updateReportStatus(reportId, status);
    await new Promise(r => setTimeout(r, 600));
    setUpdatingId(null);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = new (maplibregl as any).Map({
      container: mapRef.current,
      style: DARK_MAP_STYLE,
      center: [113.9213, -0.7893],
      zoom: 4,
      pitch: 0,
      projection: { type: 'mercator' },
      antialias: true, maxZoom: 19, attributionControl: false,
      workerUrl: maplibreWorkerUrl
    }) as maplibregl.Map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    const handleInitialLoad = () => {
      const currentReports = useMapStore.getState().reports || [];
      setupMapLayers(map, currentReports, r => onReportClickRef.current(r), true);
    };

    map.on('load', handleInitialLoad);
    map.on('style.load', handleInitialLoad);
    map.on('styledata', handleInitialLoad);
    map.on('idle', handleInitialLoad);
    handleInitialLoad();

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    mapInstance.current = map;
    return () => {
      resizeObserver.disconnect();
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    onReportClickRef.current = (report: any) => {
      if (typeof setSelectedReport === 'function') setSelectedReport(report);
      if (typeof setIsDrawerOpen   === 'function') setIsDrawerOpen(true);
    };
  }, [setSelectedReport, setIsDrawerOpen]);

  useEffect(() => {
    if (!mapInstance.current) return;
    setupMapLayers(mapInstance.current, filteredReports, r => onReportClickRef.current(r), true);
  }, [filteredReports]);

  const toggle3DMode = () => {
    if (!mapInstance.current) return;
    const nextState = !is3DMode;
    setIs3DMode(nextState);

    try {
      if (nextState) {
        (mapInstance.current as any).setProjection({ type: 'globe' });
        mapInstance.current.easeTo({ pitch: 45, duration: 600 });
      } else {
        (mapInstance.current as any).setProjection({ type: 'mercator' });
        mapInstance.current.easeTo({ pitch: 0, duration: 600 });
      }
    } catch (_) {}
  };

  const statCards = [
    { label: 'Total Insiden', value: analyticsData.total,      color: 'text-white',        bg: 'bg-slate-800/80',   border: 'border-slate-700', status: 'ALL',        icon: <Activity className="w-4 h-4 text-slate-400" /> },
    { label: 'Kritis',        value: analyticsData.critical,   color: 'text-red-400',      bg: 'bg-red-950/40',     border: 'border-red-800',   status: 'UNVERIFIED', icon: <XCircle className="w-4 h-4 text-red-400" /> },
    { label: 'Diproses',      value: analyticsData.inProgress, color: 'text-blue-400',     bg: 'bg-blue-950/40',    border: 'border-blue-800',  status: 'IN_PROGRESS',icon: <Clock className="w-4 h-4 text-blue-400" /> },
    { label: 'Selesai',       value: analyticsData.resolved,   color: 'text-emerald-400',  bg: 'bg-emerald-950/40', border: 'border-emerald-800',status:'RESOLVED',   icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 selection:bg-red-500">
      <header className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-[1500] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={() => navigate('/')} className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 border border-slate-700 shrink-0" title="Kembali ke Peta Utama">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse shrink-0" />
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white truncate">Heatmap & Analytics</h1>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Zonasi kerawanan & insiden nasional real-time</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 w-full md:w-auto shrink-0 justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1 md:flex-initial">
            {['ALL', 'BANJIR', 'LONGSOR', 'GEMPA', 'KEBAKARAN'].map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {cat === 'ALL' ? `Semua (${reports.length})` : cat}
              </button>
            ))}

            <button
              onClick={toggle3DMode}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all shrink-0 flex items-center gap-1 text-[11px] font-bold ${
                is3DMode
                  ? 'bg-blue-600 border-blue-500 text-white shadow-blue-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Alihkan Tampilan 2D / 3D"
            >
              <Globe className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${is3DMode ? 'animate-spin' : 'text-blue-400'}`} />
              <span className="hidden sm:inline">{is3DMode ? '3D' : '2D'}</span>
            </button>

            <button onClick={() => setShowStatsPanel(p => !p)} title="Panel Ringkasan"
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all shrink-0 ${showStatsPanel ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}>
              <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => setShowOfficerPanel(p => !p)} title="Dashboard Petugas"
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all shrink-0 ${showOfficerPanel ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}>
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="relative z-50 shrink-0 ml-1">
            <NotificationDropdown />
          </div>
        </nav>
      </header>

      <section ref={mapRef} className="absolute inset-0 w-full h-full z-0" />

      {showStatsPanel && (
        <aside className="absolute top-[110px] sm:top-24 left-2 sm:left-4 z-20 w-[calc(100vw-16px)] sm:w-72 md:w-80 max-h-[calc(100dvh-140px)] overflow-y-auto space-y-3 p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl scrollbar-thin scrollbar-thumb-slate-700">
          <header className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-red-500" /> Ringkasan
            </h2>
            <span className="text-[9px] sm:text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded-full border border-red-500/30 animate-pulse">Live</span>
          </header>

          <section className="grid grid-cols-2 gap-2">
            {statCards.map(card => (
              <button key={card.status}
                onClick={() => setSelectedStatus(selectedStatus === card.status ? 'ALL' : card.status)}
                className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.03] active:scale-95 ${card.bg} ${card.border} ${selectedStatus === card.status ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-white/20' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  {card.icon}
                  {selectedStatus === card.status && <Filter className="w-2.5 h-2.5 text-white/40" />}
                </div>
                <div className={`text-lg sm:text-xl font-black ${card.color}`}>{card.value}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">{card.label}</div>
              </button>
            ))}
          </section>

          <section className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-800/40 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500/60 shrink-0" />
              <div>
                <div className="text-sm font-black text-amber-400">{analyticsData.totalCasualties}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Est. Korban</div>
              </div>
            </div>
            <div className="p-2.5 bg-violet-950/30 rounded-xl border border-violet-800/40 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-violet-500/60 shrink-0" />
              <div>
                <div className="text-sm font-black text-violet-400">{analyticsData.totalValidations}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Validasi</div>
              </div>
            </div>
          </section>

          <section className="space-y-2 pt-1 border-t border-slate-800">
            <h3 className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400">Distribusi Bencana</h3>
            {analyticsData.categoriesList.map(item => (
              <button key={item.name} onClick={() => setSelectedCategory(selectedCategory === item.name ? 'ALL' : item.name)}
                className={`w-full text-left space-y-0.5 group ${selectedCategory === item.name ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
                <div className="flex justify-between text-[10px] sm:text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1">
                    {CATEGORY_ICONS[item.name] || '⚠️'} {item.name}
                  </span>
                  <span className="text-slate-400">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-500 group-hover:bg-red-400" style={{ width: `${item.percentage}%` }} />
                </div>
              </button>
            ))}
            {analyticsData.categoriesList.length === 0 && <p className="text-[10px] text-slate-500 italic py-2">Belum ada data.</p>}
          </section>

          <section className="space-y-1.5 pt-1 border-t border-slate-800">
            <h3 className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-red-400" /> Laporan Terkini
            </h3>
            {filteredReports.slice(0, 5).map(r => {
              const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.UNVERIFIED;
              return (
                <button key={r.id} onClick={() => flyToReport(r)}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all text-left group">
                  <span className="text-base shrink-0">{CATEGORY_ICONS[r.category] || '⚠️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-slate-200 truncate">{r.title}</div>
                    <div className={`text-[9px] font-semibold flex items-center gap-0.5 ${s.color}`}>{s.icon}{s.label}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                </button>
              );
            })}
          </section>
        </aside>
      )}

      {showOfficerPanel && (
        <aside className="absolute top-[110px] sm:top-24 right-2 sm:right-4 z-20 w-[calc(100vw-16px)] sm:w-80 md:w-96 max-h-[calc(100dvh-140px)] overflow-y-auto space-y-3 p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-amber-900/50 shadow-2xl shadow-amber-900/10 scrollbar-thin scrollbar-thumb-slate-700">
          <header className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Dashboard Petugas BPBD
            </h2>
            <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">Akses Terbatas</span>
          </header>

          <p className="text-[10px] text-slate-400 leading-relaxed">Klik tombol status untuk memperbarui penanganan laporan secara real-time ke semua pengguna.</p>

          <section className="space-y-2">
            {reports.map(r => {
              const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.UNVERIFIED;
              const isUpdating = updatingId === r.id;
              return (
                <article key={r.id} className={`rounded-xl border p-3 space-y-2.5 transition-all ${s.bg} ${s.border}`}>
                  <header className="flex items-start gap-2">
                    <span className="text-lg shrink-0">{CATEGORY_ICONS[r.category] || '⚠️'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-100 leading-tight">{r.title}</div>
                      <div className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${s.color}`}>
                        {s.icon} {s.label}
                      </div>
                    </div>
                    <button onClick={() => flyToReport(r)} title="Lihat di peta"
                      className="p-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-all shrink-0">
                      <MapPin className="w-3 h-3" />
                    </button>
                  </header>

                  {(r.casualties || 0) > 0 && (
                    <footer className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                      <Users className="w-3 h-3" /> {r.casualties} korban terdampak
                    </footer>
                  )}

                  <nav className="grid grid-cols-2 gap-1.5">
                    {(['UNVERIFIED', 'NEEDS_REVIEW', 'IN_PROGRESS', 'RESOLVED'] as ReportStatus[]).map(st => {
                      const cfg = STATUS_CONFIG[st];
                      const isActive = r.status === st;
                      return (
                        <button key={st} disabled={isActive || isUpdating}
                          onClick={() => handleStatusChange(r.id, st)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                            isActive
                              ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-1 ring-white/20 cursor-default`
                              : `bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 active:scale-95`
                          } ${isUpdating ? 'opacity-50' : ''}`}>
                          {isUpdating && isActive
                            ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : cfg.icon}
                          <span className="truncate">{cfg.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </nav>
                </article>
              );
            })}
            {reports.length === 0 && <p className="text-[11px] text-slate-500 italic text-center py-4">Tidak ada laporan aktif.</p>}
          </section>
        </aside>
      )}

      <aside className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 z-20 p-2.5 sm:p-3 bg-slate-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-800 shadow-2xl max-w-[180px] sm:max-w-[220px] space-y-1.5">
        <h4 className="font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 text-[9px] sm:text-[10px]">
          <Info className="w-3 h-3 text-red-500 shrink-0" /> Legenda Status
        </h4>
        <nav className="space-y-1 text-[10px] sm:text-[11px] font-semibold">
          {(['UNVERIFIED', 'IN_PROGRESS', 'RESOLVED'] as ReportStatus[]).map(st => {
            const cfg = STATUS_CONFIG[st];
            return (
              <button key={st} onClick={() => setSelectedStatus(selectedStatus === st ? 'ALL' : st)}
                className={`w-full flex items-center gap-1.5 hover:opacity-80 transition-opacity text-left ${selectedStatus === st ? 'opacity-100' : 'opacity-70'}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.bg.replace('/40', '')} border ${cfg.border}`} />
                <span className={`${cfg.color} truncate`}>{cfg.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <ReportDrawer />
    </main>
  );
};