import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/useMapStore';

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

export const MapContainer: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const currentTileLayer = useRef<L.TileLayer | null>(null);
  
  const store = useMapStore();
  const reports = store.reports || [];
  const activeCategory = store.activeCategory || store.filterCategory || 'ALL';
  const activeLayer = store.activeLayer || 'dark';
  const setSelectedReportId = store.setSelectedReportId || store.setSelectedReport || (() => {});

  // 1. Inisialisasi Peta
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Titik tengah default (Indonesia)
    leafletMap.current = L.map(mapRef.current, {
      center: [-0.7893, 113.9213], 
      zoom: 5,
      zoomControl: false,
    });

    // Tambahkan kontrol zoom ke posisi kanan atas
    L.control.zoom({ position: 'topright' }).addTo(leafletMap.current);

    markersLayer.current = L.layerGroup().addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // 2. Sinkronisasi Base Layer Peta (Safe Fallback)
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

  // 3. Render Titik Merah Dinamis (Glowing Markers)
  useEffect(() => {
    if (!leafletMap.current || !markersLayer.current) return;
    
    markersLayer.current.clearLayers();

    const filteredReports = activeCategory === 'ALL' 
      ? reports 
      : reports.filter(r => r.category === activeCategory);

    filteredReports.forEach((report) => {
      const glowingIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-4 h-4 bg-red-500 rounded-full marker-glowing-red border-2 border-white"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: glowingIcon });

      marker.on('click', () => {
        if (typeof setSelectedReportId === 'function') {
          setSelectedReportId(report.id);
        }
        leafletMap.current?.flyTo([report.latitude, report.longitude], 14, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      });

      markersLayer.current?.addLayer(marker);
    });
  }, [reports, activeCategory, setSelectedReportId]);

  return <div ref={mapRef} className="w-full h-full bg-slate-900 z-0" />;
};