import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore, MapLayerType } from '@/store/useMapStore';
import { Layers, X } from 'lucide-react';
import { setupMapLayers } from './setupMapLayers';

const MAP_STYLES: Record<string, { style: any; label: string }> = {
  dark: {
    label: '🌙 Mode Gelap',
    style: {
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
    }
  },
  streets: {
    label: '🗺️ Mode Jalan',
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap'
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  },
  satellite: {
    label: '🛰️ Mode Terang',
    style: {
      version: 8,
      sources: {
        'carto-light': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-light-layer',
          type: 'raster',
          source: 'carto-light',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    }
  }
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

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initialStyle = MAP_STYLES[activeLayer]?.style || MAP_STYLES.dark.style;

    const map = new (maplibregl as any).Map({
      container: mapRef.current,
      style: initialStyle,
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

    map.on('style.load', () => {
      try {
        (map as any).setFog(FOG_CONFIG);
      } catch (_) {}
    });

    mapInstance.current = map;

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    const targetStyle = MAP_STYLES[activeLayer]?.style || MAP_STYLES.dark.style;
    mapInstance.current.setStyle(targetStyle);
  }, [activeLayer]);

  useEffect(() => {
    if (!mapInstance.current) return;
    setupMapLayers(mapInstance.current, reports, (r) => onReportClickRef.current(r));
  }, [reports]);

  return (
    <section className="relative w-full h-full">
      <div ref={mapRef} className="relative w-full h-full z-0 bg-slate-950" />

      <aside className="absolute top-3 right-3 sm:top-6 sm:right-6 z-[1000]">
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs"
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="hidden sm:inline">Layer Peta</span>
        </button>

        {showLayerSelector && (
          <nav className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 space-y-2">
            <header className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase text-slate-500">Pilih Tampilan</span>
              <button onClick={() => setShowLayerSelector(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </header>
            {Object.entries(MAP_STYLES).map(([id, layer]) => (
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
          </nav>
        )}
      </aside>
    </section>
  );
};