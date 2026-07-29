import * as maplibregl from 'maplibre-gl';
import { Report } from '@/store/useMapStore';

const SOURCE_ID = 'gosiaga-reports-source';
const LAYER_IDS = [
  'gosiaga-heatmap-layer',
  'unclustered-glow',
  'unclustered-point',
];

const buildGeoJSON = (reports: Report[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: (reports || []).map((r) => {
    const lng = Number(r.longitude);
    const lat = Number(r.latitude);
    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [
          !isNaN(lng) && lng !== 0 ? lng : 112.7521,
          !isNaN(lat) && lat !== 0 ? lat : -7.2575
        ]
      },
      properties: {
        id: r.id,
        title: r.title || 'Laporan',
        status: r.status || 'UNVERIFIED',
        validationsCount: Math.max(1, r.validationsCount || 1),
        reportData: JSON.stringify(r)
      }
    };
  })
});

const waitForStyleLoaded = (map: maplibregl.Map): Promise<void> => {
  return new Promise((resolve) => {
    if (map.isStyleLoaded()) {
      resolve();
      return;
    }
    const check = () => {
      if (map.isStyleLoaded()) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    map.once('load', check);
    setTimeout(check, 200);
  });
};

export const setupMapLayers = async (
  map: maplibregl.Map,
  reports: Report[],
  onReportClick?: (report: Report) => void,
  isHeatmapMode = false
) => {
  const geojson = buildGeoJSON(reports);

  await waitForStyleLoaded(map);

  LAYER_IDS.forEach((id) => {
    try { if (map.getLayer(id)) map.removeLayer(id); } catch (_) {}
  });
  try { if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID); } catch (_) {}

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: geojson,
    cluster: false
  });

  if (isHeatmapMode) {
    map.addLayer({
      id: 'gosiaga-heatmap-layer',
      type: 'heatmap',
      source: SOURCE_ID,
      maxzoom: 16,
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': [
          'interpolate', ['linear'], ['zoom'],
          0, 1, 6, 2, 12, 3
        ],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgba(59,130,246,0.85)',
          0.4, 'rgba(245,158,11,0.90)',
          0.7, 'rgba(239,68,68,0.95)',
          1.0, 'rgba(255,255,255,1)'
        ],
        'heatmap-radius': [
          'interpolate', ['exponential', 1.4], ['zoom'],
          0, 10, 4, 20, 7, 35, 10, 50, 14, 75
        ],
        'heatmap-opacity': 0.9
      }
    });

    map.addLayer({
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
    map.addLayer({
      id: 'unclustered-glow',
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': [
          'match', ['get', 'status'],
          'UNVERIFIED', '#ef4444',
          'NEEDS_REVIEW', '#f59e0b',
          'IN_PROGRESS', '#3b82f6',
          'RESOLVED', '#10b981',
          '#ef4444'
        ],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 10, 8, 16, 16, 22],
        'circle-opacity': 0.45,
        'circle-blur': 0.6
      }
    });

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': [
          'match', ['get', 'status'],
          'UNVERIFIED', '#ef4444',
          'NEEDS_REVIEW', '#f59e0b',
          'IN_PROGRESS', '#3b82f6',
          'RESOLVED', '#10b981',
          '#ef4444'
        ],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 7, 8, 11, 16, 15],
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#ffffff'
      }
    });
  }

  const handlePointClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    const layersToQuery = ['unclustered-point'];
    if (map.getLayer('unclustered-glow')) layersToQuery.push('unclustered-glow');
    const features = map.queryRenderedFeatures(e.point, { layers: layersToQuery });
    if (!features.length) return;
    try {
      const reportDataStr = features[0].properties.reportData;
      if (!reportDataStr) return;
      const report: Report = JSON.parse(reportDataStr);
      map.flyTo({ center: [report.longitude, report.latitude], zoom: 15, duration: 800 });
      onReportClick?.(report);
    } catch (_) {}
  };

  map.on('click', 'unclustered-point', handlePointClick);
  map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
};

export const teardownMapLayers = (map: maplibregl.Map) => {
  LAYER_IDS.forEach((id) => {
    try { if (map.getLayer(id)) map.removeLayer(id); } catch (_) {}
  });
  try { if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID); } catch (_) {}
};
