import * as maplibregl from 'maplibre-gl';
import { Report } from '@/store/useMapStore';

const SOURCE_ID = 'reports-source';
const LAYER_IDS = [
  'reports-heatmap',
  'clusters-glow',
  'clusters-core',
  'cluster-count',
  'unclustered-glow',
  'unclustered-point',
  'unclustered-label'
];

const buildGeoJSON = (reports: Report[]): any => ({
  type: 'FeatureCollection',
  features: reports.map(r => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
    properties: {
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      validationsCount: r.validationsCount || 1,
      reportData: JSON.stringify(r)
    }
  }))
});

const ensureLayersExist = (map: maplibregl.Map, isHeatmapMode = false) => {
  if (!map.getSource(SOURCE_ID)) return;

  if (isHeatmapMode && !map.getLayer('reports-heatmap')) {
    map.addLayer({
      id: 'reports-heatmap',
      type: 'heatmap',
      source: SOURCE_ID,
      maxzoom: 15,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'validationsCount'],
          1, 0.4,
          10, 1.0
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.15, 'rgba(59, 130, 246, 0.65)',
          0.4, 'rgba(245, 158, 11, 0.8)',
          0.7, 'rgba(239, 68, 68, 0.9)',
          1.0, 'rgba(255, 255, 255, 1)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 20,
          9, 45,
          15, 80
        ],
        'heatmap-opacity': 0.85
      }
    });
  }

  if (!map.getLayer('clusters-glow')) {
    map.addLayer({
      id: 'clusters-glow',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ef4444',
        'circle-radius': ['step', ['get', 'point_count'], 30, 5, 40, 20, 55],
        'circle-opacity': 0.35,
        'circle-blur': 1.2
      }
    });
  }

  if (!map.getLayer('clusters-core')) {
    map.addLayer({
      id: 'clusters-core',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ef4444',
        'circle-radius': ['step', ['get', 'point_count'], 18, 5, 26, 20, 36],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });
  }

  if (!map.getLayer('cluster-count')) {
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 14,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0,0,0,0.5)',
        'text-halo-width': 1.5
      }
    });
  }

  if (!map.getLayer('unclustered-glow')) {
    map.addLayer({
      id: 'unclustered-glow',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
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
        'circle-radius': 22,
        'circle-opacity': 0.35,
        'circle-blur': 1
      }
    });
  }

  if (!map.getLayer('unclustered-point')) {
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
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
        'circle-radius': 11,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });
  }

  if (!map.getLayer('unclustered-label')) {
    map.addLayer({
      id: 'unclustered-label',
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      minzoom: 8,
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 12,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-allow-overlap': false
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#0f172a',
        'text-halo-width': 2
      }
    });
  }
};

const addSourceAndLayers = (map: maplibregl.Map, geojson: any, onReportClick?: (r: Report) => void, isHeatmapMode = false) => {
  if (map.getSource(SOURCE_ID)) {
    (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    ensureLayersExist(map, isHeatmapMode);
    return;
  }

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 45
  });

  ensureLayersExist(map, isHeatmapMode);

  map.on('click', 'clusters-core', async (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-core'] });
    if (!features.length) return;
    const clusterId = features[0].properties.cluster_id as number;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
    try {
      const zoom = await source.getClusterExpansionZoom(clusterId);
      map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
    } catch (_) {}
  });

  map.on('click', 'unclustered-point', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
    if (!features.length) return;
    try {
      const report: Report = JSON.parse(features[0].properties.reportData);
      map.flyTo({ center: [report.longitude, report.latitude], zoom: 15, duration: 1000, pitch: 40 });
      onReportClick?.(report);
    } catch (_) {}
  });

  map.on('mouseenter', 'clusters-core',     () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'clusters-core',     () => { map.getCanvas().style.cursor = ''; });
  map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
};

export const setupMapLayers = (
  map: maplibregl.Map,
  reports: Report[],
  onReportClick?: (report: Report) => void,
  isHeatmapMode = false
) => {
  const geojson = buildGeoJSON(reports);

  if (map.isStyleLoaded()) {
    addSourceAndLayers(map, geojson, onReportClick, isHeatmapMode);
  } else {
    map.once('style.load', () => {
      addSourceAndLayers(map, geojson, onReportClick, isHeatmapMode);
    });
  }
};

export const teardownMapLayers = (map: maplibregl.Map) => {
  LAYER_IDS.forEach(id => { try { if (map.getLayer(id)) map.removeLayer(id); } catch (_) {} });
  try { if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID); } catch (_) {}
};
