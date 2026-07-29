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
        validationsCount: r.validationsCount || 1,
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

      if (isHeatmapMode) {
        if (!map.getLayer('gosiaga-heatmap-layer')) {
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
                0, 0.6,
                6, 1.2,
                12, 2.2
              ],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(59, 130, 246, 0.75)',
                0.4, 'rgba(245, 158, 11, 0.85)',
                0.7, 'rgba(239, 68, 68, 0.95)',
                1.0, 'rgba(255, 255, 255, 1)'
              ],
              'heatmap-radius': [
                'interpolate',
                ['exponential', 1.4],
                ['zoom'],
                0, 3,
                4, 7,
                7, 15,
                10, 26,
                14, 45
              ],
              'heatmap-opacity': 0.85
            }
          });
        }
      } else {
        if (map.getLayer('gosiaga-heatmap-layer')) {
          map.removeLayer('gosiaga-heatmap-layer');
        }

        if (!map.getLayer('unclustered-glow')) {
          map.addLayer({
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
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 10, 8, 14, 16, 20],
              'circle-opacity': 0.4,
              'circle-blur': 0.6
            }
          });
        }

        if (!map.getLayer('unclustered-point')) {
          map.addLayer({
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
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 7, 8, 10, 16, 14],
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
            layout: {
              'text-field': ['concat', ['get', 'icon'], ' ', ['get', 'title']],
              'text-size': 12,
              'text-offset': [0, 1.4],
              'text-anchor': 'top',
              'text-allow-overlap': true,
              'text-ignore-placement': true
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(15, 23, 42, 0.95)',
              'text-halo-width': 2.5
            }
          });
        }
      }
    } catch (err) {
      console.error('applyLayers failed:', err);
    }
  };

  applyLayers();

  if (!isHeatmapMode) {
    let existingDomMarkers: maplibregl.Marker[] = (map as any).__gosiagaDomMarkers || [];
    existingDomMarkers.forEach((m) => m.remove());
    existingDomMarkers = [];

    (reports || []).forEach((r) => {
      const lng = Number(r.longitude);
      const lat = Number(r.latitude);
      const validLng = !isNaN(lng) && lng !== 0 ? lng : 112.7521;
      const validLat = !isNaN(lat) && lat !== 0 ? lat : -7.2575;

      const catKey = normalizeCategoryKey(r.category);

      const el = document.createElement('div');
      el.className = 'gosiaga-html-marker';
      el.style.width = '34px';
      el.style.height = '34px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = r.status === 'RESOLVED' ? '#10b981' : r.status === 'IN_PROGRESS' ? '#3b82f6' : r.status === 'NEEDS_REVIEW' ? '#f59e0b' : '#ef4444';
      el.style.border = '3px solid #ffffff';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '16px';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
      el.title = `${r.title} (${r.category})`;
      el.innerHTML = CATEGORY_ICONS[catKey] || '⚠️';

      el.onmouseenter = () => { el.style.transform = 'scale(1.25)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

      el.onclick = (e) => {
        e.stopPropagation();
        map.flyTo({ center: [validLng, validLat], zoom: 15, duration: 800 });
        onReportClick?.(r);
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([validLng, validLat])
        .addTo(map);

      existingDomMarkers.push(marker);
    });

    (map as any).__gosiagaDomMarkers = existingDomMarkers;
  } else {
    let existingDomMarkers: maplibregl.Marker[] = (map as any).__gosiagaDomMarkers || [];
    existingDomMarkers.forEach((m) => m.remove());
    (map as any).__gosiagaDomMarkers = [];
  }

  const handlePointClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point', 'unclustered-label', 'unclustered-glow'] });
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
    map.off('click', 'unclustered-label', handlePointClick);
    map.off('click', 'unclustered-glow', handlePointClick);
  } catch (_) {}

  map.on('click', 'unclustered-point', handlePointClick);
  map.on('click', 'unclustered-label', handlePointClick);
  map.on('click', 'unclustered-glow', handlePointClick);

  map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
  map.on('mouseenter', 'unclustered-label', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'unclustered-label', () => { map.getCanvas().style.cursor = ''; });
};

export const teardownMapLayers = (map: maplibregl.Map) => {
  let existingDomMarkers: maplibregl.Marker[] = (map as any).__gosiagaDomMarkers || [];
  existingDomMarkers.forEach((m) => m.remove());
  (map as any).__gosiagaDomMarkers = [];

  LAYER_IDS.forEach((id) => {
    try {
      if (map.getLayer(id)) map.removeLayer(id);
    } catch (_) {}
  });
  try {
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  } catch (_) {}
};
