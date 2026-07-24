import { create } from 'zustand';

export type ReportStatus = 'UNVERIFIED' | 'NEEDS_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
export type MapLayerType = 'dark' | 'streets' | 'satellite' | 'heatmap';

export interface Comment {
  id: string;
  authorId: string; // Contoh: "Reporter #4821"
  text: string;
  createdAt: string;
  likes: number;
}

export interface TimelineItem {
  id: string;
  title: string;
  time: string;
  status: string;
  description: string;
}

export interface Report {
  id: string;
  title: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  createdAt: string;
  photos?: string[];
  videos?: string[];
  casualties?: number;
  damage?: string;
  contactPhone?: string;
  upvotes: number;
  validationsCount: number;
  commentsCount: number;
  comments?: Comment[];
  timeline?: TimelineItem[];
  aiSummary?: string;
}

// Helper untuk mengambil/membuat Device ID permanen di localStorage
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('gosiaga_device_id');
  if (!deviceId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    deviceId = `Reporter #${randomNum}`;
    localStorage.setItem('gosiaga_device_id', deviceId);
  }
  return deviceId;
};

interface MapStore {
  reports: Report[];
  selectedReport: Report | null;
  isFormOpen: boolean;
  isDrawerOpen: boolean;
  activeLayer: MapLayerType;
  activeCategory: string;

  // Actions
  setSelectedReport: (report: Report | null) => void;
  setSelectedReportId: (id: string | null) => void;
  setIsFormOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setActiveLayer: (layer: MapLayerType) => void;
  setActiveCategory: (cat: string) => void;
  addReport: (report: Report) => void;
  addComment: (reportId: string, text: string) => void;
  toggleUpvote: (reportId: string) => void;
}

// Dummy Data Awal
const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    title: 'Banjir Luapan Sungai Kalimas',
    category: 'BANJIR',
    description: 'Ketinggian air mencapai 80cm di jalan pemukiman. Kendaraan roda dua tidak dapat melintas.',
    latitude: -7.2575,
    longitude: 112.7521,
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString(),
    photos: ['https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800'],
    casualties: 0,
    damage: '12 Rumah Terendam',
    contactPhone: '081234567890',
    upvotes: 24,
    validationsCount: 15,
    commentsCount: 2,
    aiSummary: '⚡ **Ringkasan AI**: Potensi luapan air memuncak hingga malam hari. Hindari lintasan Jalan Kalimas dan gunakan jalur alternatif barat.',
    timeline: [
      { id: 't1', title: 'Laporan Dibuat', time: '10:00 WIB', status: 'UNVERIFIED', description: 'Pelapor mengirimkan laporan bencana awal.' },
      { id: 't2', title: 'Diverifikasi Warga', time: '10:15 WIB', status: 'NEEDS_REVIEW', description: '5 Warga sekitar mengonfirmasi kebenaran foto.' },
      { id: 't3', title: 'Tim BPBD Meluncur', time: '10:40 WIB', status: 'IN_PROGRESS', description: 'Regu penanggulangan BPBD dalam perjalanan lokasi.' },
    ],
    comments: [
      { id: 'c1', authorId: 'Reporter #1092', text: 'Air mulai naik drastis sejak jam 9 pagi tadi.', createdAt: '10:10 WIB', likes: 4 },
      { id: 'c2', authorId: 'Reporter #8831', text: 'Perahu karet BPBD sudah ada di lokasi perempatan.', createdAt: '10:45 WIB', likes: 7 },
    ]
  },
  {
    id: 'rep-2',
    title: 'Pohon Tumbang Menutup Jalan',
    category: 'ANGIN_PUTING_BELIUNG',
    description: 'Pohon peneduh jalan berukuran besar tumbang menutup total akses kendaraan.',
    latitude: -7.2800,
    longitude: 112.7300,
    status: 'UNVERIFIED',
    createdAt: new Date().toISOString(),
    photos: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800'],
    casualties: 0,
    damage: 'Kabel listrik putus',
    upvotes: 5,
    validationsCount: 3,
    commentsCount: 1,
    aiSummary: '⚡ **Ringkasan AI**: Akses lalu lintas terputus total. Petugas Dinas Kebersihan sedang dikontak.',
    timeline: [
      { id: 't1', title: 'Laporan Dibuat', time: '11:20 WIB', status: 'UNVERIFIED', description: 'Laporan baru diterima dari warga.' }
    ],
    comments: [
      { id: 'c1', authorId: 'Reporter #4821', text: 'Macet panjang dari arah stasiun.', createdAt: '11:25 WIB', likes: 2 }
    ]
  }
];

export const useMapStore = create<MapStore>((set, get) => ({
  reports: INITIAL_REPORTS,
  selectedReport: null,
  isFormOpen: false,
  isDrawerOpen: false,
  activeLayer: 'dark',
  activeCategory: 'ALL',

  setSelectedReport: (report) => set({ selectedReport: report }),
  setSelectedReportId: (id) => {
    if (!id) {
      set({ selectedReport: null });
      return;
    }
    const found = get().reports.find((r) => r.id === id) || null;
    set({ selectedReport: found });
  },
  setIsFormOpen: (open) => set({ isFormOpen: open }),
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  addReport: (newReport) => set((state) => ({ 
    reports: [newReport, ...state.reports] 
  })),

  addComment: (reportId, text) => {
    const authorId = getDeviceId();
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId,
      text,
      createdAt: 'Baru saja',
      likes: 0,
    };

    set((state) => ({
      reports: state.reports.map((r) => {
        if (r.id === reportId) {
          const updatedComments = [...(r.comments || []), newComment];
          const updatedTimeline = [
            ...(r.timeline || []),
            {
              id: `t-${Date.now()}`,
              title: `Komentar baru dari ${authorId}`,
              time: 'Baru saja',
              status: r.status,
              description: text
            }
          ];
          const updatedReport = {
            ...r,
            comments: updatedComments,
            commentsCount: updatedComments.length,
            timeline: updatedTimeline,
          };
          if (state.selectedReport?.id === reportId) {
            set({ selectedReport: updatedReport });
          }
          return updatedReport;
        }
        return r;
      }),
    }));
  },

  toggleUpvote: (reportId) => {
    set((state) => ({
      reports: state.reports.map((r) => {
        if (r.id === reportId) {
          const updated = { ...r, upvotes: r.upvotes + 1, validationsCount: r.validationsCount + 1 };
          if (state.selectedReport?.id === reportId) {
            set({ selectedReport: updated });
          }
          return updated;
        }
        return r;
      }),
    }));
  }
}));