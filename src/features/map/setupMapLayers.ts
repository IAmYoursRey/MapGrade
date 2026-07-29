import * as maplibregl from 'maplibre-gl';
import { Report } from '@/store/useMapStore';

const SOURCE_ID = 'gosiaga-reports-source';
const LAYER_IDS = [
  'gosiaga-heatmap-layer',
  'clusters-glow',
  'clusters-core',
  'cluster-count',
  'unclustered-glow',
  'unclustered-point',
  'unclustered-label'
];

const CATEGORY_ICONS: Record<string, string> = {
  BANJIR: '🌊',
  LONGSOR: '⛰️',
  GEMPA: '🌍',
  KEBAKARAN: '🔥',
  TSUNAMI: '🌊',
  ANGIN_PUTING_BELIUNG: '🌪️',
  LAINNYA: '⚠️',
};

const normalizeCategoryKey = (cat?: string): string => {
  if (!cat) return 'LAINNYA';
  const clean = cat.toUpperCase().trim();
  if (clean.includes('BANJIR')) return 'BANJIR';
  if (clean.includes('LONGSOR')) return 'LONGSOR';
  if (clean.includes('GEMPA')) return 'GEMPA';
  if (clean.includes('KEBAKARAN')) return 'KEBAKARAN';
  if (clean.includes('TSUNAMI')) return 'TSUNAMI';
  if (clean.includes('ANGIN') || clean.includes('PUTING')) return 'ANGIN_PUTING_BELIUNG';
  return 'LAINNYA';
};

const buildGeoJSON = (reports: Report[]): any => ({
  type: 'FeatureCollection',
  features: (reports || []).map((r) => {
    const lng = Number(r.longitude);
    const lat = Number(r.latitude);
    const validLng = !isNaN(lng) && lng !== 0 ? lng : 112.7521;
    const validLat = !isNaN(lat) && lat !== 0 ? lat : -7.2575;

    const catKey = normalizeCategoryKey(r.category);

    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [validLng, validLat] },
      properties: {
        id: r.id,
        title: r.title || 'Laporan Bencana',
        category: catKey,
        status: r.status || 'UNVERIFIED',
        icon: CATEGORY_ICONS[catKey] || '⚠️',
        validationsCount: Math.max(1, r.validationsCount || 1),
        reportData: JSON.stringify(r)
      }
    };
  })
});

export const setupMapLayers = (
  map: maplibregl.Map,
  reports: Report[],
  onReportClick?: (report: Report) => void,
  isHeatmapMode = false
) => {
  const geojson = buildGeoJSON(reports);

  const applyLayers = () => {
    try {
      if (map.getSource(SOURCE_ID)) {
        (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: geojson,
          cluster: false
        });
      }

      const addLayerToTop = (layerSpec: maplibregl.LayerSpecification) => {
        if (map.getLayer(layerSpec.id)) {
          map.removeLayer(layerSpec.id);
        }
        map.addLayer(layerSpec);
      };

      if (isHeatmapMode) {
        LAYER_IDS.forEach((id) => {
          if (id !== 'gosiaga-heatmap-layer' && id !== 'unclustered-point' && map.getLayer(id)) {
            map.removeLayer(id);
          }
        });

        addLayerToTop({
          id: 'gosiaga-heatmap-layer',
          type: 'heatmap',
          source: SOURCE_ID,
          maxzoom: 16,
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              6, 2,
              12, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.2, 'rgba(59, 130, 246, 0.85)',
              0.4, 'rgba(245, 158, 11, 0.90)',
              0.7, 'rgba(239, 68, 68, 0.95)',
              1.0, 'rgba(255, 255, 255, 1)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['exponential', 1.4],
              ['zoom'],
              0, 10,
              4, 20,
              7, 35,
              10, 50,
              14, 75
            ],
            'heatmap-opacity': 0.9
          }
        });

        addLayerToTop({
          id: 'unclustered-point',
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-color': '#ef4444',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      } else {
        if (map.getLayer('gosiaga-heatmap-layer')) {
          map.removeLayer('gosiaga-heatmap-layer');
        }

        addLayerToTop({
          id: 'unclustered-glow',
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-color': [
              'match',
              ['get', 'status'],
              'UNVERIFIED',   '#ef4444',
              'NEEDS_REVIEW', '#f59e0b',
              'IN_PROGRESS',  '#3b82f6',
              'RESOLVED',     '#10b981',
              '#ef4444'
            ],
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 10, 8, 16, 16, 22],
            'circle-opacity': 0.45,
            'circle-blur': 0.6
          }
        });

        addLayerToTop({
          id: 'unclustered-point',
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-color': [
              'match',
              ['get', 'status'],
              'UNVERIFIED',   '#ef4444',
              'NEEDS_REVIEW', '#f59e0b',
              'IN_PROGRESS',  '#3b82f6',
              'RESOLVED',     '#10b981',
              '#ef4444'
            ],
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 7, 8, 11, 16, 15],
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff'
          }
        });
      }
    } catch (err) {
      console.error('applyLayers error:', err);
    }
  };

  applyLayers();

  const handlePointClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point', 'unclustered-glow'] });
    if (!features.length) return;
    try {
      const reportDataStr = features[0].properties.reportData;
      if (!reportDataStr) return;
      const report: Report = JSON.parse(reportDataStr);
      map.flyTo({ center: [report.longitude, report.latitude], zoom: 15, duration: 800 });
      onReportClick?.(report);
    } catch (_) {}
  };

  try {
    map.off('click', 'unclustered-point', handlePointClick);
    map.off('click', 'unclustered-glow', handlePointClick);
  } catch (_) {}

  map.on('click', 'unclustered-point', handlePointClick);
  map.on('click', 'unclustered-glow', handlePointClick);

  map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
};

export const teardownMapLayers = (map: maplibregl.Map) => {
  LAYER_IDS.forEach((id) => {
    try {
      if (map.getLayer(id)) map.removeLayer(id);
    } catch (_) {}
  });
  try {
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  } catch (_) {}
};
