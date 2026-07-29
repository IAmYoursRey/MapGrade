import * as maplibregl from 'maplibre-gl';
import { Report, ReportStatus } from '@/store/useMapStore';

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

const buildGeoJSON = (reports: Report[]): any => ({
  type: 'FeatureCollection',
  features: reports.map((r) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
    properties: {
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      icon: CATEGORY_ICONS[r.category] || '⚠️',
      validationsCount: r.validationsCount || 1,
      reportData: JSON.stringify(r)
    }
  }))
});

export const setupMapLayers = (
  map: maplibregl.Map,
  reports: Report[],
  onReportClick?: (report: Report) => void,
  isHeatmapMode = false
) => {
  const geojson = buildGeoJSON(reports);

  const applyLayers = () => {
    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: geojson,
        cluster: !isHeatmapMode,
        clusterMaxZoom: 12,
        clusterRadius: 50
      });
    }

    if (isHeatmapMode && !map.getLayer('gosiaga-heatmap-layer')) {
      map.addLayer({
        id: 'gosiaga-heatmap-layer',
        type: 'heatmap',
        source: SOURCE_ID,
        maxzoom: 16,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'validationsCount'],
            1, 0.5,
            10, 1.0
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.4,
            6, 1.0,
            12, 2.0
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(59, 130, 246, 0.65)',
            0.4, 'rgba(245, 158, 11, 0.8)',
            0.7, 'rgba(239, 68, 68, 0.95)',
            1.0, 'rgba(255, 255, 255, 1)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 6,
            4, 12,
            8, 22,
            14, 35
          ],
          'heatmap-opacity': 0.85
        }
      });
    }

    if (!isHeatmapMode && !map.getLayer('clusters-glow')) {
      map.addLayer({
        id: 'clusters-glow',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#ef4444',
          'circle-radius': ['step', ['get', 'point_count'], 20, 5, 28, 15, 36],
          'circle-opacity': 0.35,
          'circle-blur': 0.8
        }
      });
    }

    if (!isHeatmapMode && !map.getLayer('clusters-core')) {
      map.addLayer({
        id: 'clusters-core',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#ef4444',
          'circle-radius': ['step', ['get', 'point_count'], 14, 5, 20, 15, 26],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    if (!isHeatmapMode && !map.getLayer('cluster-count')) {
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.5)',
          'text-halo-width': 1
        }
      });
    }

    if (!map.getLayer('unclustered-glow')) {
      map.addLayer({
        id: 'unclustered-glow',
        type: 'circle',
        source: SOURCE_ID,
        filter: isHeatmapMode ? undefined : ['!', ['has', 'point_count']],
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
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 8, 8, 14, 16, 22],
          'circle-opacity': 0.35,
          'circle-blur': 0.6
        }
      });
    }

    if (!map.getLayer('unclustered-point')) {
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: SOURCE_ID,
        filter: isHeatmapMode ? undefined : ['!', ['has', 'point_count']],
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
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 5, 8, 8, 16, 12],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    if (!map.getLayer('unclustered-label')) {
      map.addLayer({
        id: 'unclustered-label',
        type: 'symbol',
        source: SOURCE_ID,
        filter: isHeatmapMode ? undefined : ['!', ['has', 'point_count']],
        minzoom: 5,
        layout: {
          'text-field': ['concat', ['get', 'icon'], ' ', ['get', 'title']],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(15, 23, 42, 0.95)',
          'text-halo-width': 2
        }
      });
    }
  };

  if (map.isStyleLoaded()) {
    applyLayers();
  } else {
    map.once('style.load', applyLayers);
  }

  if (!isHeatmapMode) {
    try {
      map.off('click', 'clusters-core', () => {});
    } catch (_) {}
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

    map.on('mouseenter', 'clusters-core', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters-core', () => { map.getCanvas().style.cursor = ''; });
  }

  try {
    map.off('click', 'unclustered-point', () => {});
  } catch (_) {}

  map.on('click', 'unclustered-point', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
    if (!features.length) return;
    try {
      const report: Report = JSON.parse(features[0].properties.reportData);
      map.flyTo({ center: [report.longitude, report.latitude], zoom: 15, duration: 800 });
      onReportClick?.(report);
    } catch (_) {}
  });

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
