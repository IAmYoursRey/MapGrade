import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore, ReportStatus, MapLayerType } from '@/store/useMapStore';
import { Layers, X } from 'lucide-react';

export const InteractiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const { reports, setSelectedReport, activeLayer, setActiveLayer } = useMapStore();
  const [showLayerSelector, setShowLayerSelector] = useState(false);

  // Map Tile Providers (dengan penanganan huruf besar & kecil + fallback)
  const tileUrls: Record<string, { url: string; attr: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attr: '&copy; CartoDB'
    },
    DARK: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attr: '&copy; CartoDB'
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attr: '&copy; OpenStreetMap'
    },
    STREET: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attr: '&copy; OpenStreetMap'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri'
    },
    SATELLITE: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri'
    },
    heatmap: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attr: '&copy; CartoDB Heat'
    }
  };

  const currentTile = tileUrls[activeLayer] || tileUrls.dark;

  // Status Marker Colors
  const getMarkerColor = (status: ReportStatus) => {
    switch (status) {
      case 'UNVERIFIED': return '#ef4444'; // 🔴 Merah (Baru)
      case 'NEEDS_REVIEW': return '#f59e0b'; // 🟠 Kuning (Perlu Review)
      case 'IN_PROGRESS': return '#3b82f6'; // 🔵 Biru (Ditangani BPBD)
      case 'RESOLVED': return '#10b981'; // 🟢 Hijau (Selesai)
      default: return '#6b7280'; // ⚫ Hitam (Arsip)
    }
  };

  // Init Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current, {
      center: [-7.2575, 112.7521], // Surabaya Default
      zoom: 12,
      zoomControl: false
    });

    L.tileLayer(currentTile.url, {
      attribution: currentTile.attr
    }).addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!leafletMap.current) return;
    leafletMap.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        leafletMap.current?.removeLayer(layer);
      }
    });
    L.tileLayer(currentTile.url, {
      attribution: currentTile.attr
    }).addTo(leafletMap.current);
  }, [activeLayer]);

  // Render Markers dynamically
  useEffect(() => {
    if (!leafletMap.current) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    reports.forEach((report) => {
      const color = getMarkerColor(report.status);
      
      const customIcon = L.divIcon({
        className: 'custom-marker-pin',
        html: `
          <div style="
            width: 28px; 
            height: 28px; 
            background-color: ${color}; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 15px ${color}; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon })
        .addTo(leafletMap.current!)
        .on('click', () => {
          setSelectedReport(report);
          leafletMap.current?.flyTo([report.latitude, report.longitude], 15, { duration: 1 });
        });

      markersRef.current[report.id] = marker;
    });
  }, [reports]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full z-0 bg-slate-900" />

      {/* Floating Layer Selector Button */}
      <div className="absolute top-6 right-6 z-[1000]">
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs"
        >
          <Layers className="w-5 h-5 text-red-500" />
          Layer Peta
        </button>

        {/* Modal Layer Options */}
        {showLayerSelector && (
          <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs font-extrabold uppercase text-slate-500">Pilih Tampilan</span>
              <button onClick={() => setShowLayerSelector(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            {[
              { id: 'dark', label: '🌙 Mode Gelap' },
              { id: 'streets', label: '🗺️ Mode Jalan' },
              { id: 'satellite', label: '🛰️ Satelit' },
              { id: 'heatmap', label: '🔥 Heatmap Bencana' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => {
                  setActiveLayer(layer.id as MapLayerType);
                  setShowLayerSelector(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLayer === layer.id
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};