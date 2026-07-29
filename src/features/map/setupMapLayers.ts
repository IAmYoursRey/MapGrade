import * as maplibregl from 'maplibre-gl';
import { Report } from '@/store/useMapStore';

const SOURCE_ID = 'gosiaga-reports-source';

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

const removeLayers = (map: maplibregl.Map) => {
  const ids = ['gosiaga-heatmap-layer', 'unclustered-glow', 'unclustered-point'];
  ids.forEach((id) => {
    try { if (map.getLayer(id)) map.removeLayer(id); } catch (_) {}
  });
  try { if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID); } catch (_) {}
};

const addLayers = (map: maplibregl.Map, geojson: GeoJSON.FeatureCollection, isHeatmapMode: boolean) => {
  removeLayers(map);

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
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 6, 2, 12, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgba(59,130,246,0.85)',
          0.4, 'rgba(245,158,11,0.90)',
          0.7, 'rgba(239,68,68,0.95)',
          1.0, 'rgba(255,255,255,1)'
        ],
        'heatmap-radius': ['interpolate', ['exponential', 1.4], ['zoom'], 0, 10, 4, 20, 7, 35, 10, 50, 14, 75],
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
};

export const setupMapLayers = (
  map: maplibregl.Map,
  reports: Report[],
  onReportClick?: (report: Report) => void,
  isHeatmapMode = false
) => {
  const geojson = buildGeoJSON(reports);

  const doAdd = () => {
    try {
      addLayers(map, geojson, isHeatmapMode);
    } catch (err) {
      console.warn('[setupMapLayers] addLayers failed, will retry on style.load:', err);
    }
  };

  if (map.isStyleLoaded()) {
    doAdd();
  }

  map.once('style.load', () => {
    try {
      addLayers(map, geojson, isHeatmapMode);
    } catch (_) {}
  });

  const handlePointClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    const layersToQuery: string[] = [];
    try { if (map.getLayer('unclustered-point')) layersToQuery.push('unclustered-point'); } catch (_) {}
    try { if (map.getLayer('unclustered-glow')) layersToQuery.push('unclustered-glow'); } catch (_) {}
    if (!layersToQuery.length) return;

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

  map.on('click', handlePointClick);
  map.on('mouseenter', 'unclustered-point', () => { try { map.getCanvas().style.cursor = 'pointer'; } catch (_) {} });
  map.on('mouseleave', 'unclustered-point', () => { try { map.getCanvas().style.cursor = ''; } catch (_) {} });
};

export const updateMapData = (map: maplibregl.Map, reports: Report[]) => {
  const geojson = buildGeoJSON(reports);
  try {
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
      return;
    }
  } catch (_) {}
};

export const teardownMapLayers = (map: maplibregl.Map) => {
  removeLayers(map);
};
