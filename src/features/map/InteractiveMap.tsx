import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore, MapLayerType } from '@/store/useMapStore';
import { useAuthStore, isDevUser as checkIsDevUser, hasMapMarkPermission } from '@/store/useAuthStore';
import { Layers, X, MapPin, Globe } from 'lucide-react';
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

export const InteractiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const prevLayerRef = useRef<string | null>(null);

  const { user } = useAuthStore();
  const canMarkMap = hasMapMarkPermission(user);

  const store = useMapStore();
  const reports = store.reports || [];
  const activeLayer = store.activeLayer || 'dark';
  const setSelectedReport = store.setSelectedReport || store.setSelectedReportId;
  const setIsDrawerOpen = store.setIsDrawerOpen;
  const setIsFormOpen = store.setIsFormOpen;
  const setManualCoords = store.setManualCoords;
  const setActiveLayer = store.setActiveLayer;

  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

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
    prevLayerRef.current = activeLayer;

    const map = new (maplibregl as any).Map({
      container: mapRef.current,
      style: initialStyle,
      center: [118.0, -2.5],
      zoom: 4.8,
      pitch: 0,
      projection: { type: 'mercator' },
      antialias: true,
      maxZoom: 19,
      attributionControl: false,
      workerUrl: maplibreWorkerUrl
    }) as maplibregl.Map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    const handleInitialLoad = () => {
      if (mapInstance.current) {
        const currentReports = useMapStore.getState().reports || [];
        setupMapLayers(mapInstance.current, currentReports, (r) => onReportClickRef.current(r), false);
      }
    };

    if (map.isStyleLoaded()) {
      handleInitialLoad();
    } else {
      map.once('load', handleInitialLoad);
      map.once('style.load', handleInitialLoad);
    }

    map.on('click', (e) => {
      const currentUser = useAuthStore.getState().user;
      const authorized = hasMapMarkPermission(currentUser);

      if (authorized) {
        setManualCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        setIsFormOpen(true);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    setTimeout(() => {
      try {
        map.resize();
      } catch (_) {}
    }, 150);

    mapInstance.current = map;

    return () => {
      resizeObserver.disconnect();
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    if (prevLayerRef.current === activeLayer) return;

    prevLayerRef.current = activeLayer;
    const targetStyle = MAP_STYLES[activeLayer]?.style || MAP_STYLES.dark.style;

    const onStyleLoad = () => {
      if (mapInstance.current) {
        setupMapLayers(mapInstance.current, reports, (r) => onReportClickRef.current(r), false);
      }
    };

    mapInstance.current.setStyle(targetStyle);

    if (mapInstance.current.isStyleLoaded()) {
      onStyleLoad();
    } else {
      mapInstance.current.once('style.load', onStyleLoad);
    }
  }, [activeLayer]);

  useEffect(() => {
    if (!mapInstance.current) return;
    if (mapInstance.current.isStyleLoaded()) {
      setupMapLayers(mapInstance.current, reports, (r) => onReportClickRef.current(r), false);
    } else {
      mapInstance.current.once('style.load', () => {
        if (mapInstance.current) {
          setupMapLayers(mapInstance.current, reports, (r) => onReportClickRef.current(r), false);
        }
      });
    }
  }, [reports]);

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

  return (
    <section className="relative w-full h-full min-h-[500px] overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full min-h-[500px] z-0 bg-slate-950" />

      {canMarkMap && (
        <aside className="absolute top-3 left-3 sm:top-6 sm:left-6 z-[1000] flex items-center gap-2 max-w-[calc(100vw-120px)] sm:max-w-md">
          <article className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl sm:rounded-2xl border border-red-500/30 shadow-xl flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-200">
            <MapPin className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
            <span className="truncate">Otoritas Akses: Klik lokasi mana saja di peta untuk tandai bencana tanpa GPS</span>
          </article>
        </aside>
      )}

      <aside className="absolute top-3 right-3 sm:top-6 sm:right-6 z-[1000] flex items-center gap-2">
        <button
          onClick={toggle3DMode}
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border flex items-center gap-2 transition-all font-bold text-xs ${
            is3DMode
              ? 'bg-blue-600 border-blue-500 text-white shadow-blue-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
          title="Alihkan Tampilan 2D (Ringan) / 3D"
        >
          <Globe className={`w-4 h-4 sm:w-5 sm:h-5 ${is3DMode ? 'animate-spin' : 'text-blue-500'}`} />
          <span className="hidden sm:inline">{is3DMode ? 'Mode 3D (Aktif)' : 'Mode 2D (Ringan)'}</span>
        </button>

        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs"
        >
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="hidden sm:inline">Layer Peta</span>
        </button>

        {showLayerSelector && (
          <nav className="absolute right-0 top-12 mt-2 w-48 sm:w-56 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 space-y-2">
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