import { create } from 'zustand';
import { EmergencyReport, ReportStatus } from '@/types';

type MapLayerType = 'STREET' | 'DARK' | 'SATELLITE';

interface MapState {
  reports: EmergencyReport[];
  activeCategory: string | 'ALL';
  activeLayer: MapLayerType;
  selectedReportId: string | null;
  
  setReports: (reports: EmergencyReport[]) => void;
  setActiveCategory: (category: string) => void;
  setActiveLayer: (layer: MapLayerType) => void;
  setSelectedReportId: (id: string | null) => void;
}

// Data Simulasi Awal (Mock Data) untuk rendering titik di peta
const mockReports: EmergencyReport[] = [
  {
    id: '1',
    title: 'Kebakaran Lahan Hutan',
    description: 'Api membesar di area lereng gunung, mendekati pemukiman.',
    category: 'Kebakaran',
    latitude: -7.952,
    longitude: 112.614,
    status: 'UNVERIFIED',
    validVotes: 2,
    invalidVotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Banjir Bandang',
    description: 'Air sungai meluap memutus jalan utama desa.',
    category: 'Banjir',
    latitude: -6.917,
    longitude: 107.619,
    status: 'VERIFIED_CROWD',
    validVotes: 15,
    invalidVotes: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const useMapStore = create<MapState>((set) => ({
  reports: mockReports,
  activeCategory: 'ALL',
  activeLayer: 'DARK', // Default gelap ala Radio Garden
  selectedReportId: null,

  setReports: (reports) => set({ reports }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setSelectedReportId: (id) => set({ selectedReportId: id }),
}));