import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore, ReportStatus } from '@/store/useMapStore';

// Pilihan Tile Peta dengan fallback lengkap (Aman dari 'undefined')
const MAP_LAYERS: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  STREET: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  heatmap: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

// Fungsi Warna Marker Berdasarkan Status
const getStatusColor = (status?: ReportStatus | string) => {
  switch (status) {
    case 'UNVERIFIED': return '#ef4444'; // 🔴 Merah (Baru / Belum Verifikasi)
    case 'NEEDS_REVIEW': return '#f59e0b'; // 🟠 Kuning (Perlu Review)
    case 'IN_PROGRESS': return '#3b82f6'; // 🔵 Biru (Sedang Ditangani BPBD)
    case 'RESOLVED': return '#10b981'; // 🟢 Hijau (Selesai)
    default: return '#6b7280'; // ⚫ Abu-abu (Arsip / Lainnya)
  }
};

export const MapContainer: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const currentTileLayer = useRef<L.TileLayer | null>(null);
  
  const store = useMapStore();
  const reports = store.reports || [];
  const activeCategory = store.activeCategory || store.filterCategory || 'ALL';
  const activeLayer = store.activeLayer || 'dark';

  // Extract fungsi store dengan aman
  const setSelectedReport = store.setSelectedReport || store.setSelectedReportId || (() => {});
  const setIsDrawerOpen = store.setIsDrawerOpen || (() => {});

  // 1. Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Default lokasi: Indonesia Center
    leafletMap.current = L.map(mapRef.current, {
      center: [-0.7893, 113.9213], 
      zoom: 5,
      zoomControl: false,
    });

    // Kontrol Zoom di Posisi Kanan Atas
    L.control.zoom({ position: 'topright' }).addTo(leafletMap.current);

    markersLayer.current = L.layerGroup().addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // 2. Update Layer Peta saat `activeLayer` Berubah
  useEffect(() => {
    if (!leafletMap.current) return;

    if (currentTileLayer.current) {
      leafletMap.current.removeLayer(currentTileLayer.current);
    }

    const tileUrl = MAP_LAYERS[activeLayer] || MAP_LAYERS.dark;

    currentTileLayer.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors & GoSiaga',
      maxZoom: 19,
    }).addTo(leafletMap.current);
  }, [activeLayer]);

  // 3. Render Marker Dinamis dengan Event Klik Lengkap
  useEffect(() => {
    if (!leafletMap.current || !markersLayer.current) return;
    
    markersLayer.current.clearLayers();

    const filteredReports = activeCategory === 'ALL' 
      ? reports 
      : reports.filter(r => r.category === activeCategory);

    filteredReports.forEach((report) => {
      const color = getStatusColor(report.status);

      // Icon Kustom dengan Efek Glowing Sesuai Status
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            width: 22px; 
            height: 22px; 
            background-color: ${color}; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 12px ${color}; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      // EVENT KLIK MARKER: Pindah Peta + Pilih Laporan + Buka Drawer
      marker.on('click', () => {
        if (typeof setSelectedReport === 'function') {
          setSelectedReport(report);
        }
        if (typeof setIsDrawerOpen === 'function') {
          setIsDrawerOpen(true);
        }

        leafletMap.current?.flyTo([report.latitude, report.longitude], 15, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      });

      markersLayer.current?.addLayer(marker);
    });
  }, [reports, activeCategory, setSelectedReport, setIsDrawerOpen]);

  return <div ref={mapRef} className="w-full h-full bg-slate-900 z-0" />;
};