import { create } from 'zustand';

export type ReportStatus = 'UNVERIFIED' | 'NEEDS_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
export type MapLayerType = 'dark' | 'streets' | 'satellite' | 'heatmap';

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'INFO' | 'SUCCESS' | 'WARNING';
  timestamp: string;
  read: boolean;
  reportId?: string;
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
  invalidationsCount?: number;
  votedBy?: string[];
  invalidatedBy?: string[];
  commentsCount: number;
  comments?: Comment[];
  timeline?: TimelineItem[];
  aiSummary?: string;
}

// Device ID Permanen via localStorage
export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'Reporter #0000';
  let deviceId = localStorage.getItem('gosiaga_device_id');
  if (!deviceId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    deviceId = `Reporter #${randomNum}`;
    localStorage.setItem('gosiaga_device_id', deviceId);
  }
  return deviceId;
};

export interface MapStore {
  reports: Report[];
  selectedReport: Report | null;
  isFormOpen: boolean;
  isDrawerOpen: boolean;
  activeLayer: MapLayerType;
  activeCategory: string;
  filterCategory?: string; // 👈 Menambahkan optional property agar MapContainer tidak error

  // --- STATE NOTIFIKASI BARU ---
  notifications: AppNotification[];
  unreadCount: number;

  setSelectedReport: (report: Report | null) => void;
  setSelectedReportId: (id: string | null) => void;
  setIsFormOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setActiveLayer: (layer: MapLayerType) => void;
  setActiveCategory: (cat: string) => void;
  addReport: (report: Report) => void;
  addComment: (reportId: string, text: string) => void;
  toggleUpvote: (reportId: string) => void;
  handleValidation: (reportId: string, type: 'valid' | 'invalid') => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  
  // --- FUNGSI NOTIFIKASI BARU ---
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    title: 'Banjir Luapan Sungai Kalimas',
    category: 'BANJIR',
    description: 'Ketinggian air mencapai 80cm di pemukiman. Kendaraan roda dua tidak dapat melintas.',
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
    invalidationsCount: 0,
    votedBy: [],
    invalidatedBy: [],
    commentsCount: 2,
    aiSummary: '⚡ **Ringkasan AI**: Luapan air berpotensi bertahan hingga malam. Hindari lintasan Jalan Kalimas.',
    timeline: [
      { id: 't1', title: 'Laporan Dibuat', time: '10:00 WIB', status: 'UNVERIFIED', description: 'Warga mengirimkan laporan bencana.' },
      { id: 't2', title: 'Diverifikasi Warga', time: '10:15 WIB', status: 'NEEDS_REVIEW', description: '5 Warga mengonfirmasi titik kejadian.' },
      { id: 't3', title: 'Tim BPBD Meluncur', time: '10:40 WIB', status: 'IN_PROGRESS', description: 'Regu penanggulangan dalam perjalanan.' },
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
    description: 'Pohon peneduh besar tumbang menutup total jalan utama.',
    latitude: -7.2800,
    longitude: 112.7300,
    status: 'UNVERIFIED',
    createdAt: new Date().toISOString(),
    photos: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800'],
    casualties: 0,
    damage: 'Kabel listrik terputus',
    upvotes: 5,
    validationsCount: 3,
    invalidationsCount: 0,
    votedBy: [],
    invalidatedBy: [],
    commentsCount: 1,
    aiSummary: '⚡ **Ringkasan AI**: Akses jalan terputus total. Gunakan rute evakuasi lingkar selatan.',
    timeline: [
      { id: 't1', title: 'Laporan Dibuat', time: '11:20 WIB', status: 'UNVERIFIED', description: 'Laporan diterima dari warga.' }
    ],
    comments: [
      { id: 'c1', authorId: 'Reporter #4821', text: 'Lalu lintas mengalami antrean panjang.', createdAt: '11:25 WIB', likes: 2 }
    ]
  },
  {
    id: 'rep-3',
    title: 'Kebakaran Hutan Lahan Gambut',
    category: 'KEBAKARAN',
    description: 'Titik api terdeteksi meluas di area lahan gambut. Jarak pandang mulai terbatas.',
    latitude: -1.2379, 
    longitude: 114.8080,
    status: 'NEEDS_REVIEW',
    createdAt: new Date().toISOString(),
    casualties: 0,
    damage: '50 Hektar Hutan Gambut',
    upvotes: 42,
    validationsCount: 28,
    invalidationsCount: 2,
    votedBy: [],
    invalidatedBy: [],
    commentsCount: 0,
    aiSummary: '⚡ **Ringkasan AI**: Arah angin membawa asap ke pemukiman warga. Butuh pemantauan udara segera.'
  },
  {
    id: 'rep-4',
    title: 'Gempa Bumi Dangkal',
    category: 'GEMPA',
    description: 'Gempa magnitudo 5.2 terasa kuat, beberapa bangunan retak.',
    latitude: -0.8917,
    longitude: 119.8707,
    status: 'IN_PROGRESS', 
    createdAt: new Date().toISOString(),
    casualties: 3,
    damage: 'Infrastruktur jalan & 5 ruko rusak',
    upvotes: 89,
    validationsCount: 65,
    invalidationsCount: 0,
    votedBy: [],
    invalidatedBy: [],
    commentsCount: 4,
    aiSummary: '⚡ **Ringkasan AI**: Tim evakuasi sedang mendata kerusakan bangunan di pusat kota Palu.'
  },
  {
    id: 'rep-5',
    title: 'Longsor Jalur Lintas Provinsi',
    category: 'LONGSOR',
    description: 'Material longsor menutup separuh badan jalan setelah hujan deras semalaman.',
    latitude: -0.9471,
    longitude: 100.4172,
    status: 'UNVERIFIED',
    createdAt: new Date().toISOString(),
    casualties: 0,
    damage: 'Jalan tertutup sebagian',
    upvotes: 12,
    validationsCount: 5,
    invalidationsCount: 0,
    votedBy: [],
    invalidatedBy: [],
    commentsCount: 0,
    aiSummary: '⚡ **Ringkasan AI**: Arus lalu lintas tersendat, alat berat sedang diusahakan menuju lokasi.'
  },
  {
    id: 'rep-6',
    title: 'Banjir Bandang Pegunungan',
    category: 'BANJIR',
    description: 'Debit air sungai naik drastis membawa material lumpur dan kayu.',
    latitude: -2.5337,
    longitude: 140.7181,
    status: 'RESOLVED',
    createdAt: new Date().toISOString(),
    casualties: 0,
    damage: 'Jembatan desa putus',
    upvotes: 34,
    validationsCount: 20,
    invalidationsCount: 0,
    votedBy: [],
    invalidatedBy: [],
    commentsCount: 0,
    aiSummary: '⚡ **Ringkasan AI**: Air mulai surut. Warga bergotong-royong membersihkan sisa lumpur.'
  }
];

export const useMapStore = create<MapStore>((set, get) => ({
  reports: INITIAL_REPORTS,
  selectedReport: null,
  isFormOpen: false,
  isDrawerOpen: false,
  activeLayer: 'dark',
  activeCategory: 'ALL',

  notifications: [
    {
      id: 'notif-1',
      title: '🚨 Laporan Krisis Baru',
      message: 'Banjir Luapan Sungai Kalimas membutuhkan penanganan segera.',
      type: 'CRITICAL',
      timestamp: '5 menit lalu',
      read: false,
      reportId: 'rep-1'
    },
    {
      id: 'notif-2',
      title: '✅ Status Diperbarui',
      message: 'Tim BPBD telah meluncur ke lokasi Pohon Tumbang.',
      type: 'SUCCESS',
      timestamp: '20 menit lalu',
      read: false,
      reportId: 'rep-2'
    }
  ],
  unreadCount: 2,

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
              title: `Tanggapan dari ${authorId}`,
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
          const updated = { 
            ...r, 
            upvotes: r.upvotes + 1, 
            validationsCount: r.validationsCount + 1 
          };
          if (state.selectedReport?.id === reportId) {
            set({ selectedReport: updated });
          }
          return updated;
        }
        return r;
      }),
    }));
  },

  handleValidation: (reportId: string, type: 'valid' | 'invalid') => {
    const deviceId = getDeviceId();

    set((state) => {
      const updatedReports = state.reports.map((r) => {
        if (r.id === reportId) {
          let newVotedBy = [...(r.votedBy || [])];
          let newInvalidatedBy = [...(r.invalidatedBy || [])];

          let newValidCount = r.validationsCount || 0;
          let newInvalidCount = r.invalidationsCount || 0;

          if (type === 'valid') {
            if (newVotedBy.includes(deviceId)) {
              newVotedBy = newVotedBy.filter((id) => id !== deviceId);
              newValidCount -= 1;
            } else {
              newVotedBy.push(deviceId);
              newValidCount += 1;
              if (newInvalidatedBy.includes(deviceId)) {
                newInvalidatedBy = newInvalidatedBy.filter((id) => id !== deviceId);
                newInvalidCount -= 1;
              }
            }
          } else if (type === 'invalid') {
            if (newInvalidatedBy.includes(deviceId)) {
              newInvalidatedBy = newInvalidatedBy.filter((id) => id !== deviceId);
              newInvalidCount -= 1;
            } else {
              newInvalidatedBy.push(deviceId);
              newInvalidCount += 1;
              if (newVotedBy.includes(deviceId)) {
                newVotedBy = newVotedBy.filter((id) => id !== deviceId);
                newValidCount -= 1;
              }
            }
          }

          return {
            ...r,
            votedBy: newVotedBy,
            invalidatedBy: newInvalidatedBy,
            validationsCount: Math.max(0, newValidCount),
            invalidationsCount: Math.max(0, newInvalidCount),
          };
        }
        return r;
      });

      const updatedSelectedReport =
        state.selectedReport?.id === reportId
          ? updatedReports.find((r) => r.id === reportId) || state.selectedReport
          : state.selectedReport;

      return {
        reports: updatedReports,
        selectedReport: updatedSelectedReport,
      };
    });
  },

  updateReportStatus: (reportId: string, status: ReportStatus) => {
    set((state) => {
      const updatedReports = state.reports.map((r) => {
        if (r.id === reportId) {
          const updatedTimeline = [
            ...(r.timeline || []),
            {
              id: `t-${Date.now()}`,
              title: `Status Diperbarui: ${status}`,
              time: 'Baru saja',
              status: status,
              description: 'Status laporan telah diperbarui oleh Tim BPBD.'
            }
          ];

          return {
            ...r,
            status,
            timeline: updatedTimeline
          };
        }
        return r;
      });

      const updatedSelectedReport =
        state.selectedReport?.id === reportId
          ? updatedReports.find((r) => r.id === reportId) || state.selectedReport
          : state.selectedReport;

      return {
        reports: updatedReports,
        selectedReport: updatedSelectedReport
      };
    });
  },

  markNotificationAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length
      };
    });
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  addNotification: (notif) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Baru saja',
      read: false
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },
}));