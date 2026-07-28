import * as maplibregl from 'maplibre-gl';
import { Report } from '@/store/useMapStore';

const SOURCE_ID = 'reports-source';
const LAYER_IDS = ['clusters-glow', 'clusters-core', 'cluster-count', 'unclustered-point'];

/**
 * Build a GeoJSON FeatureCollection from reports array.
 */
const buildGeoJSON = (reports: Report[]): any => ({
  type: 'FeatureCollection',
  features: reports.map(r => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
    properties: {
      id: r.id,
      status: r.status,
      reportData: JSON.stringify(r)
    }
  }))
});

/**
 * Add source + layers to the map. Must only be called when style is loaded.
 */
const addSourceAndLayers = (map: maplibregl.Map, geojson: any, onReportClick?: (r: Report) => void) => {
  if (map.getSource(SOURCE_ID)) {
    // Source already exists — just update data
    (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    return;
  }

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // --- Cluster glow (blurred halo) ---
  map.addLayer({
    id: 'clusters-glow',
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#ef4444',
      'circle-radius': ['step', ['get', 'point_count'], 30, 10, 40, 50, 50],
      'circle-opacity': 0.25,
      'circle-blur': 1.2
    }
  });

  // --- Cluster solid core ---
  map.addLayer({
    id: 'clusters-core',
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#ef4444',
      'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
      'circle-stroke-width': 2.5,
      'circle-stroke-color': '#ffffff'
    }
  });

  // --- Cluster count label ---
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 13,
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': 'rgba(0,0,0,0.3)',
      'text-halo-width': 1
    }
  });

  // --- Single (unclustered) point ---
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
        '#6b7280'
      ],
      'circle-radius': 10,
      'circle-stroke-width': 2.5,
      'circle-stroke-color': '#ffffff'
    }
  });

  // --- Interactivity (only register once per source creation) ---
  map.on('click', 'clusters-core', async (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-core'] });
    if (!features.length) return;
    const clusterId = features[0].properties.cluster_id as number;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
    try {
      const zoom = await source.getClusterExpansionZoom(clusterId);
      map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
    } catch (_) { /* ignore */ }
  });

  map.on('click', 'unclustered-point', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
    if (!features.length) return;
    try {
      const report: Report = JSON.parse(features[0].properties.reportData);
      map.flyTo({ center: [report.longitude, report.latitude], zoom: 16, duration: 1000, pitch: 45 });
      onReportClick?.(report);
    } catch (_) { /* ignore */ }
  });

  map.on('mouseenter', 'clusters-core',     () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'clusters-core',     () => { map.getCanvas().style.cursor = ''; });
  map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
};

/**
 * Main entry point. Call whenever reports change or after style loads.
 * Safely no-ops if style is not ready yet.
 */
export const setupMapLayers = (
  map: maplibregl.Map,
  reports: Report[],
  onReportClick?: (report: Report) => void
) => {
  const geojson = buildGeoJSON(reports);

  if (map.isStyleLoaded()) {
    addSourceAndLayers(map, geojson, onReportClick);
  } else {
    map.once('style.load', () => {
      addSourceAndLayers(map, geojson, onReportClick);
    });
  }
};

/**
 * Tear down all layers/source (call before changing style to avoid duplicate-layer errors).
 * MapLibre auto-removes layers/sources on setStyle, so this is mainly useful for manual cleanup.
 */
export const teardownMapLayers = (map: maplibregl.Map) => {
  LAYER_IDS.forEach(id => { try { if (map.getLayer(id)) map.removeLayer(id); } catch (_) {} });
  try { if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID); } catch (_) {}
};
