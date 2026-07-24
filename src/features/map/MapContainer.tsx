import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/useMapStore';

const MAP_LAYERS = {
  DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', // Tema gelap standar startup
  STREET: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

export const MapContainer: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const currentTileLayer = useRef<L.TileLayer | null>(null);
  
  const { reports, activeCategory, activeLayer, setSelectedReportId } = useMapStore();

  // 1. Inisialisasi Peta
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Titik tengah default (Indonesia)
    leafletMap.current = L.map(mapRef.current, {
      center: [-0.7893, 113.9213], 
      zoom: 5,
      zoomControl: false, // Kita sembunyikan default zoom untuk UI yang lebih bersih
    });

    // Tambahkan kontrol zoom ke posisi kanan atas
    L.control.zoom({ position: 'topright' }).addTo(leafletMap.current);

    markersLayer.current = L.layerGroup().addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // 2. Sinkronisasi Base Layer Peta
  useEffect(() => {
    if (!leafletMap.current) return;

    if (currentTileLayer.current) {
      leafletMap.current.removeLayer(currentTileLayer.current);
    }

    currentTileLayer.current = L.tileLayer(MAP_LAYERS[activeLayer], {
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
      // CSS Class "marker-glowing-red" diambil dari globals.css
      const glowingIcon = L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-4 h-4 bg-red-500 rounded-full marker-glowing-red border-2 border-white"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: glowingIcon });

      // Animasi Radio Garden Style saat diklik
      marker.on('click', () => {
        setSelectedReportId(report.id);
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