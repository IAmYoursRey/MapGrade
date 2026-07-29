import * as maplibregl from 'maplibre-gl';
import { useMapStore, Report } from '@/store/useMapStore';

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
  map: any,
  reports: Report[],
  onReportClick?: (report: Report) => void,
  isHeatmapMode = false
) => {
  map.__latestGeoJSON = buildGeoJSON(reports);
  map.__isHeatmapMode = isHeatmapMode;

  const doAdd = () => {
    try {
      if (!map.isStyleLoaded()) return;
      if (!map.getSource(SOURCE_ID)) {
        addLayers(map, map.__latestGeoJSON, map.__isHeatmapMode);
      } else {
        map.getSource(SOURCE_ID).setData(map.__latestGeoJSON);
      }
    } catch (err) {
      console.warn('[setupMapLayers] doAdd failed:', err);
    }
  };

  if (map.isStyleLoaded()) {
    doAdd();
  }

  const onStyleLoad = () => { try { doAdd(); } catch (_) {} };
  map.on('style.load', onStyleLoad);
  
  const onLoad = () => { try { doAdd(); } catch (_) {} };
  map.on('load', onLoad);

  const handlePointClick = (e: any) => {
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

  const onMouseEnter = () => { try { map.getCanvas().style.cursor = 'pointer'; } catch (_) {} };
  const onMouseLeave = () => { try { map.getCanvas().style.cursor = ''; } catch (_) {} };

  map.on('click', handlePointClick);
  map.on('mouseenter', 'unclustered-point', onMouseEnter);
  map.on('mouseleave', 'unclustered-point', onMouseLeave);

  return () => {
    map.off('style.load', onStyleLoad);
    map.off('load', onLoad);
    map.off('click', handlePointClick);
    map.off('mouseenter', 'unclustered-point', onMouseEnter);
    map.off('mouseleave', 'unclustered-point', onMouseLeave);
  };
};

export const updateMapData = (map: any, reports: Report[]) => {
  const geojson = buildGeoJSON(reports);
  map.__latestGeoJSON = geojson;

  try {
    if (!map.isStyleLoaded()) return;
    const source = map.getSource(SOURCE_ID);
    if (source) {
      source.setData(geojson);
    } else {
      addLayers(map, geojson, map.__isHeatmapMode || false);
    }
  } catch (_) {}
};

export const teardownMapLayers = (map: maplibregl.Map) => {
  removeLayers(map);
};
