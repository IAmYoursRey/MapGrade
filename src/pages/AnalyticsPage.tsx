import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import { useMapStore, Report } from '@/store/useMapStore';
import { NotificationDropdown } from '@/components/common/NotificationDropdown';
import {
  Info,
  ArrowLeft,
  Activity,
  Users,
  BarChart2,
  Flame
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const navigate = useNavigate();
  const { reports = [], setSelectedReport, setIsDrawerOpen } = useMapStore();

  // State Filter & Tampilan Panel
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus] = useState<string>('ALL');
  const [showStatsPanel, setShowStatsPanel] = useState<boolean>(true);

  // 1. Kalkulasi Statistik & Analytics Ringkasan
  const analyticsData = useMemo(() => {
    const total = reports.length;
    const critical = reports.filter(
      (r) => r.status === 'UNVERIFIED' || r.status === 'NEEDS_REVIEW'
    ).length;
    const inProgress = reports.filter((r) => r.status === 'IN_PROGRESS').length;
    const resolved = reports.filter((r) => r.status === 'RESOLVED').length;
    const totalCasualties = reports.reduce((acc, r) => acc + (r.casualties || 0), 0);
    const totalValidations = reports.reduce((acc, r) => acc + (r.validationsCount || 0), 0);

    // Grouping berdasarkan kategori
    const categoryCounts: Record<string, number> = {};
    reports.forEach((r) => {
      const cat = r.category || 'LAINNYA';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoriesList = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      critical,
      inProgress,
      resolved,
      totalCasualties,
      totalValidations,
      categoriesList,
    };
  }, [reports]);

  // 2. Filter Laporan berdasarkan Kategori & Status
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        selectedCategory === 'ALL' || report.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'ALL' || report.status === selectedStatus;
      return matchesCategory && matchesStatus;
    });
  }, [reports, selectedCategory, selectedStatus]);

  // 3. Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [-0.7893, 113.9213], // Titik tengah Indonesia
      zoom: 5,
      zoomControl: false,
    });

    // Custom Zoom Control Posisi Kanan Atas
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & GoSiaga Analytics',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    leafletMap.current = map;

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // 4. Update Layer Heatmap & Circles Saat Data Filter Berubah
  useEffect(() => {
    if (!leafletMap.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    filteredReports.forEach((report: Report) => {
      // Menentukan warna berdasarkan status
      let color = '#f59e0b'; // Amber (default / review)
      let fillColor = '#f59e0b';

      if (report.status === 'UNVERIFIED' || report.status === 'NEEDS_REVIEW') {
        color = '#ef4444'; // Merah (Kritis / Unverified)
        fillColor = '#ef4444';
      } else if (report.status === 'IN_PROGRESS') {
        color = '#3b82f6'; // Biru (Penanganan)
        fillColor = '#3b82f6';
      } else if (report.status === 'RESOLVED') {
        color = '#10b981'; // Hijau (Teratasi)
        fillColor = '#10b981';
      }

      // Hitung radius zona bencana berdasarkan jumlah validasi
      const radius = 12000 + (report.validationsCount || 0) * 1500;

      // Circle untuk area dampak heatmap
      const circle = L.circle([report.latitude, report.longitude], {
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.35,
        weight: 2,
        radius: radius,
      });

      // Marker Titik Pusat Bencana
      const centerMarker = L.circleMarker([report.latitude, report.longitude], {
        radius: 6,
        color: '#ffffff',
        fillColor: color,
        fillOpacity: 1,
        weight: 2,
      });

      // Popup Detail Ringkas
      const popupContent = `
        <div style="color: #0f172a; font-family: sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px;">${report.title}</div>
          <div style="display: flex; gap: 4px; margin-bottom: 6px;">
            <span style="background: #fee2e2; color: #991b1b; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">${report.category}</span>
            <span style="background: #e0f2fe; color: #075985; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">${report.status}</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            📍 Validasi: <b>${report.validationsCount || 0} warga</b>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);

      // Event Click pada Circle & Marker
      const handleReportClick = () => {
        if (typeof setSelectedReport === 'function') {
          setSelectedReport(report);
        }
        if (typeof setIsDrawerOpen === 'function') {
          setIsDrawerOpen(true);
        }
      };

      circle.on('click', handleReportClick);
      centerMarker.on('click', handleReportClick);

      layerGroupRef.current?.addLayer(circle);
      layerGroupRef.current?.addLayer(centerMarker);
    });
  }, [filteredReports, setSelectedReport, setIsDrawerOpen]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* 🔴 TOP HEADER BAR (z-30 agar di atas peta tetapi di bawah dropdown notifikasi) */}
      <header className="absolute top-4 left-4 right-4 z-30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 md:px-5 md:py-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 border border-slate-700"
            title="Kembali ke Peta Utama"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <h1 className="text-base md:text-lg font-black tracking-tight text-white">
                Heatmap & Analytics Bencana
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Visualisasi zonasi kerawanan & distribusi insiden nasional real-time
            </p>
          </div>
        </div>

        {/* Filter Cepat Category & Dropdown Notifikasi */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Semua Bencana ({reports.length})
          </button>
          {['BANJIR', 'LONGSOR', 'GEMPA', 'KEBAKARAN'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setShowStatsPanel(!showStatsPanel)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Toggle Panel Statistik"
          >
            <BarChart2 className="w-4 h-4 text-red-400" />
          </button>

          {/* 🔔 DROPDOWN NOTIFIKASI (z-50: Dijamin terbuka paling depan di atas peta dan panel) */}
          <div className="relative z-50 ml-auto md:ml-1">
            <NotificationDropdown />
          </div>
        </div>
      </header>

      {/* 🟢 MAP CONTAINER */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* 📊 LEFT PANEL: STATISTIK & BREAKDOWN BENCANA (z-20) */}
      {showStatsPanel && (
        <aside className="absolute top-28 md:top-24 left-4 z-20 w-80 max-h-[calc(100vh-140px)] overflow-y-auto space-y-3 p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl hidden md:block scrollbar-thin scrollbar-thumb-slate-700">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-500" /> Ringkasan Analitik
            </h2>
            <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30">
              Live Data
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Insiden</div>
              <div className="text-xl font-black text-white mt-1">{analyticsData.total}</div>
            </div>

            <div className="p-3 bg-red-950/40 rounded-xl border border-red-800/50">
              <div className="text-[10px] font-bold text-red-400 uppercase">Status Kritis</div>
              <div className="text-xl font-black text-red-500 mt-1">{analyticsData.critical}</div>
            </div>

            <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/50">
              <div className="text-[10px] font-bold text-blue-400 uppercase">Penanganan</div>
              <div className="text-xl font-black text-blue-400 mt-1">{analyticsData.inProgress}</div>
            </div>

            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/50">
              <div className="text-[10px] font-bold text-emerald-400 uppercase">Teratasi</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{analyticsData.resolved}</div>
            </div>
          </div>

          {/* Korban Jiwa & Dampak Card */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Est. Dampak Korban</div>
              <div className="text-lg font-black text-amber-400">{analyticsData.totalCasualties} Orang</div>
            </div>
            <Users className="w-8 h-8 text-amber-500/40" />
          </div>

          {/* Distribusi Kategori Bencana */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-extrabold uppercase text-slate-400">Distribusi Jenis Bencana</h3>
            {analyticsData.categoriesList.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-slate-400">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {analyticsData.categoriesList.length === 0 && (
              <p className="text-xs text-slate-500 italic py-2">Belum ada data bencana terdaftar.</p>
            )}
          </div>
        </aside>
      )}

      {/* 🟡 HEATMAP LEGEND (z-20) */}
      <div className="absolute bottom-6 right-6 z-20 p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl max-w-xs space-y-2.5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-red-500" /> Legenda Zonasi Bencana
        </h4>

        <div className="space-y-2 text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/20 shrink-0"></span>
            <span className="text-slate-200">Kritis / Belum Terverifikasi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shrink-0"></span>
            <span className="text-slate-200">Sedang Ditangani Petugas</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0"></span>
            <span className="text-slate-200">Lokasi Selesai / Aman</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20 shrink-0"></span>
            <span className="text-slate-200">Perlu Peninjauan / Waspada</span>
          </div>
        </div>
      </div>
    </div>
  );
};