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

const removeHeatmap = (map: maplibregl.Map) => {
  try { if (map.getLayer('gosiaga-heatmap-layer')) map.removeLayer('gosiaga-heatmap-layer'); } catch (_) {}
  try { if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID); } catch (_) {}
};

const renderDOMMarkers = (map: any, reports: Report[], onReportClick?: (report: Report) => void, isHeatmapMode = false) => {
  if (map.__customMarkers) {
    map.__customMarkers.forEach((m: any) => m.remove());
  }
  map.__customMarkers = [];

  reports.forEach(r => {
    const lng = Number(r.longitude);
    const lat = Number(r.latitude);
    if (isNaN(lng) || isNaN(lat)) return;

    const el = document.createElement('div');
    el.style.position = 'relative';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.cursor = 'pointer';

    const color = 
      r.status === 'UNVERIFIED' ? '#ef4444' :
      r.status === 'NEEDS_REVIEW' ? '#f59e0b' :
      r.status === 'IN_PROGRESS' ? '#3b82f6' :
      r.status === 'RESOLVED' ? '#10b981' : '#ef4444';

    if (!isHeatmapMode) {
      const glow = document.createElement('div');
      glow.style.position = 'absolute';
      glow.style.top = '50%';
      glow.style.left = '50%';
      glow.style.transform = 'translate(-50%, -50%)';
      glow.style.width = '24px';
      glow.style.height = '24px';
      glow.style.borderRadius = '50%';
      glow.style.backgroundColor = color;
      glow.style.opacity = '0.45';
      glow.style.filter = 'blur(3px)';
      glow.style.pointerEvents = 'none';
      el.appendChild(glow);
    }

    const point = document.createElement('div');
    point.style.position = 'absolute';
    point.style.top = '50%';
    point.style.left = '50%';
    point.style.transform = 'translate(-50%, -50%)';
    point.style.width = isHeatmapMode ? '12px' : '16px';
    point.style.height = isHeatmapMode ? '12px' : '16px';
    point.style.borderRadius = '50%';
    point.style.backgroundColor = color;
    point.style.border = '2.5px solid #ffffff';
    point.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    point.style.transition = 'transform 0.2s ease';
    
    el.addEventListener('mouseenter', () => point.style.transform = 'translate(-50%, -50%) scale(1.15)');
    el.addEventListener('mouseleave', () => point.style.transform = 'translate(-50%, -50%) scale(1)');

    el.appendChild(point);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        map.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });
      } catch (_) {}
      onReportClick?.(r);
    });

    try {
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
      map.__customMarkers.push(marker);
    } catch (_) {}
  });
};

const addHeatmap = (map: maplibregl.Map, geojson: GeoJSON.FeatureCollection) => {
  removeHeatmap(map);
  
  try {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojson,
      cluster: false
    });

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
  } catch (err) {
    console.warn('[setupMapLayers] addHeatmap failed:', err);
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
  map.__latestReports = reports;
  map.__onReportClick = onReportClick;

  // Render DOM markers immediately (they don't wait for style.load)
  renderDOMMarkers(map, reports, onReportClick, isHeatmapMode);

  const doAddHeatmap = () => {
    if (!map.__isHeatmapMode) return;
    try {
      if (!map.isStyleLoaded()) return;
      if (!map.getSource(SOURCE_ID)) {
        addHeatmap(map, map.__latestGeoJSON);
      } else {
        map.getSource(SOURCE_ID).setData(map.__latestGeoJSON);
      }
    } catch (_) {}
  };

  if (map.isStyleLoaded()) {
    doAddHeatmap();
  }

  const onStyleLoad = () => { try { doAddHeatmap(); } catch (_) {} };
  map.on('style.load', onStyleLoad);
  
  const onLoad = () => { try { doAddHeatmap(); } catch (_) {} };
  map.on('load', onLoad);

  return () => {
    map.off('style.load', onStyleLoad);
    map.off('load', onLoad);
    if (map.__customMarkers) {
      map.__customMarkers.forEach((m: any) => m.remove());
    }
  };
};

export const updateMapData = (map: any, reports: Report[]) => {
  const geojson = buildGeoJSON(reports);
  map.__latestGeoJSON = geojson;
  map.__latestReports = reports;

  // Update DOM markers immediately
  renderDOMMarkers(map, reports, map.__onReportClick, map.__isHeatmapMode);

  // Update Heatmap if active
  if (map.__isHeatmapMode) {
    try {
      if (!map.isStyleLoaded()) return;
      const source = map.getSource(SOURCE_ID);
      if (source) {
        source.setData(geojson);
      } else {
        addHeatmap(map, geojson);
      }
    } catch (_) {}
  }
};

export const teardownMapLayers = (map: maplibregl.Map) => {
  removeHeatmap(map);
  if ((map as any).__customMarkers) {
    (map as any).__customMarkers.forEach((m: any) => m.remove());
  }
};
