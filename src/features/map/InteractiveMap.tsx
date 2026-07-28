import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore, MapLayerType } from '@/store/useMapStore';
import { Layers, X } from 'lucide-react';
import { setupMapLayers } from './setupMapLayers';

const TILE_URLS: Record<string, { url: string; label: string }> = {
  dark: {
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    label: '🌙 Mode Gelap'
  },
  streets: {
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    label: '🗺️ Mode Jalan'
  },
  satellite: {
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    label: '🛰️ Positron'
  },
};

const FOG_CONFIG = {
  'color': 'rgb(12, 20, 42)',
  'high-color': 'rgb(20, 30, 60)',
  'horizon-blend': 0.08,
  'space-color': 'rgb(5, 8, 18)',
  'star-intensity': 0.6,
};

export const InteractiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  const store = useMapStore();
  const reports = store.reports || [];
  const activeLayer = store.activeLayer || 'dark';
  const setSelectedReport = store.setSelectedReport || store.setSelectedReportId;
  const setIsDrawerOpen = store.setIsDrawerOpen;
  const setActiveLayer = store.setActiveLayer;

  const [showLayerSelector, setShowLayerSelector] = useState(false);

  // Keep a stable ref to the click callback so we don't re-register listeners
  const onReportClickRef = useRef((report: any) => {
    if (typeof setSelectedReport === 'function') setSelectedReport(report);
    if (typeof setIsDrawerOpen === 'function') setIsDrawerOpen(true);
  });

  useEffect(() => {
    onReportClickRef.current = (report: any) => {
      if (typeof setSelectedReport === 'function') setSelectedReport(report);
      if (typeof setIsDrawerOpen === 'function') setIsDrawerOpen(true);
    };
  }, [setSelectedReport, setIsDrawerOpen]);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new (maplibregl as any).Map({
      container: mapRef.current,
      style: TILE_URLS[activeLayer]?.url || TILE_URLS.dark.url,
      center: [112.7521, -7.2575],
      zoom: 10,
      projection: { type: 'globe' },
      antialias: true,
      maxZoom: 19,
      attributionControl: false,
    }) as maplibregl.Map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    map.dragRotate.enable();
    map.touchPitch.enable();

    // Apply atmosphere / globe fog on every style load (including style changes)
    map.on('style.load', () => {
      (map as any).setFog(FOG_CONFIG);
    });

    mapInstance.current = map;

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tile layer change
  useEffect(() => {
    if (!mapInstance.current) return;
    const styleUrl = TILE_URLS[activeLayer]?.url || TILE_URLS.dark.url;
    mapInstance.current.setStyle(styleUrl);
    // Layers will be re-added automatically via the reports useEffect below
    // because setupMapLayers waits for style.load internally.
  }, [activeLayer]);

  // Sync reports → map layers whenever reports or map changes
  useEffect(() => {
    if (!mapInstance.current) return;
    setupMapLayers(mapInstance.current, reports, (r) => onReportClickRef.current(r));
  }, [reports]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="relative w-full h-full z-0 bg-slate-950" />

      {/* Layer Selector */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-[1000]">
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs"
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="hidden sm:inline">Layer Peta</span>
        </button>

        {showLayerSelector && (
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-500">Pilih Tampilan</span>
              <button onClick={() => setShowLayerSelector(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            {Object.entries(TILE_URLS).map(([id, layer]) => (
              <button
                key={id}
                onClick={() => {
                  if (typeof setActiveLayer === 'function') setActiveLayer(id as MapLayerType);
                  setShowLayerSelector(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLayer === id
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