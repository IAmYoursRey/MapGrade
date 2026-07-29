import { create } from 'zustand';
import { formatIndonesiaTimestamp } from '@/utils/dateUtils';

export type ReportStatus = 'UNVERIFIED' | 'NEEDS_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
export type MapLayerType = 'dark' | 'streets' | 'satellite';

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  likes: number;
  photoUrl?: string;
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
  archivedReports: Report[];
  selectedReport: Report | null;
  manualCoords: { lat: number; lng: number } | null;
  isFormOpen: boolean;
  isDrawerOpen: boolean;
  activeLayer: MapLayerType;
  activeCategory: string;
  filterCategory?: string; 
  notifications: AppNotification[];
  unreadCount: number;

  setSelectedReport: (report: Report | null) => void;
  setSelectedReportId: (id: string | null) => void;
  setManualCoords: (coords: { lat: number; lng: number } | null) => void;
  setIsFormOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setActiveLayer: (layer: MapLayerType) => void;
  setActiveCategory: (cat: string) => void;
  addReport: (report: Report) => void;
  updateReport: (reportId: string, data: Partial<Report>) => void;
  deleteReport: (reportId: string) => void;
  addComment: (reportId: string, text: string, photoUrl?: string) => void;
  toggleUpvote: (reportId: string) => void;
  handleValidation: (reportId: string, type: 'valid' | 'invalid') => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  exportReportsJSON: () => void;
  importReportsJSON: (jsonStr: string) => boolean;
}

const REPORTS_STORAGE_KEY = 'gosiaga_reports_data';
const ARCHIVED_STORAGE_KEY = 'gosiaga_archived_reports_data';

const DEFAULT_SEED_REPORTS: Report[] = [
  {
    id: 'report-seed-1',
    title: 'Banjir Bandang Luapan Sungai Citarum',
    category: 'BANJIR',
    description: 'Genangan air setinggi 80 cm meluap ke pemukiman warga akibat curah hujan tinggi sejak dini hari.',
    latitude: -6.9175,
    longitude: 107.6191,
    status: 'IN_PROGRESS',
    createdAt: formatIndonesiaTimestamp(Date.now() - 3600000 * 5),
    photos: ['https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800'],
    casualties: 120,
    damage: '45 Rumah Terendam Air',
    contactPhone: '081234567890',
    upvotes: 24,
    validationsCount: 18,
    invalidationsCount: 1,
    commentsCount: 3,
    aiSummary: 'Banjir berada di tingkat bahaya sedang. Tim BPBD telah menerjunkan perahu karet di sektor 3.'
  },
  {
    id: 'report-seed-2',
    title: 'Tanah Longsor Jalur Perbukitan Surabaya-Malang',
    category: 'LONGSOR',
    description: 'Material tebing menutup badan jalan utama, mengakibatkan arus lalu lintas lumpuh total.',
    latitude: -7.2575,
    longitude: 112.7521,
    status: 'UNVERIFIED',
    createdAt: formatIndonesiaTimestamp(Date.now() - 3600000 * 2),
    photos: ['https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800'],
    casualties: 0,
    damage: 'Akses Jalan Utama Terputus',
    contactPhone: '081515876022',
    upvotes: 12,
    validationsCount: 9,
    invalidationsCount: 0,
    commentsCount: 2,
    aiSummary: 'Perlu pembersihan material menggunakan alat berat. Jalur dialihkan sementara.'
  },
  {
    id: 'report-seed-3',
    title: 'Kebakaran Lahan Hutan Pinus',
    category: 'KEBAKARAN',
    description: 'Asap tebal mengepul dari area hutan akibat suhu udara panas dan tiupan angin kencang.',
    latitude: -7.7956,
    longitude: 110.3695,
    status: 'NEEDS_REVIEW',
    createdAt: formatIndonesiaTimestamp(Date.now() - 3600000 * 8),
    photos: ['https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800'],
    casualties: 5,
    damage: '2 Hektar Lahan Terbakar',
    contactPhone: '081999888777',
    upvotes: 30,
    validationsCount: 25,
    invalidationsCount: 2,
    commentsCount: 4,
    aiSummary: 'Tim Pemadam Kebakaran sedang berupaya melokalisir titik api agar tidak mendekati area pemukiman.'
  }
];

const getInitialReports = (): Report[] => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SEED_REPORTS;
};

const getInitialArchivedReports = (): Report[] => {
  try {
    const stored = localStorage.getItem(ARCHIVED_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const saveReportsToStorage = (reports: Report[]) => {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch {}
};

const saveArchivedReportsToStorage = (archived: Report[]) => {
  try {
    localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(archived));
  } catch {}
};

export const useMapStore = create<MapStore>((set, get) => {
  return {
    reports: getInitialReports(),
    archivedReports: getInitialArchivedReports(),
    selectedReport: null,
    manualCoords: null,
    isFormOpen: false,
    isDrawerOpen: false,
    activeLayer: 'dark',
    activeCategory: 'ALL',

    notifications: [],
    unreadCount: 0,

    setSelectedReport: (report) => set({ selectedReport: report }),
    setSelectedReportId: (id) => {
      if (!id) {
        set({ selectedReport: null });
        return;
      }
      const found = get().reports.find((r) => r.id === id) || null;
      set({ selectedReport: found });
    },
    setManualCoords: (coords) => set({ manualCoords: coords }),
    setIsFormOpen: (open) => set({ isFormOpen: open }),
    setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
    setActiveLayer: (layer) => set({ activeLayer: layer }),
    setActiveCategory: (cat) => set({ activeCategory: cat }),

    addReport: (newReport) => {
      const formattedReport: Report = {
        ...newReport,
        createdAt: newReport.createdAt ? formatIndonesiaTimestamp(newReport.createdAt) : formatIndonesiaTimestamp()
      };

      set((state) => {
        const updated = [formattedReport, ...state.reports];
        saveReportsToStorage(updated);
        return { reports: updated, manualCoords: null };
      });
    },

    updateReport: (reportId: string, data: Partial<Report>) => {
      set((state) => {
        const updatedReports = state.reports.map((report) => {
          if (report.id !== reportId) return report;
          return {
            ...report,
            ...data,
            createdAt: data.createdAt ? formatIndonesiaTimestamp(data.createdAt) : report.createdAt
          };
        });

        const updatedSelected = state.selectedReport?.id === reportId
          ? updatedReports.find((r) => r.id === reportId) || null
          : state.selectedReport;

        saveReportsToStorage(updatedReports);
        return { reports: updatedReports, selectedReport: updatedSelected };
      });
    },

    deleteReport: (reportId) => {
      set((state) => {
        const targetReport = state.reports.find((r) => r.id === reportId);
        const updatedReports = state.reports.filter((r) => r.id !== reportId);
        
        let updatedArchived = state.archivedReports;
        if (targetReport) {
          const archivedItem: Report = {
            ...targetReport,
            status: 'ARCHIVED',
            timeline: [
              ...(targetReport.timeline || []),
              {
                id: `t-archive-${Date.now()}`,
                title: 'Laporan Diarsipkan / Dihapus dari Peta',
                time: formatIndonesiaTimestamp(),
                status: 'ARCHIVED',
                description: 'Laporan telah diselesaikan/dihapus dan disimpan dalam arsip terpisah.'
              }
            ]
          };
          updatedArchived = [archivedItem, ...state.archivedReports];
          saveArchivedReportsToStorage(updatedArchived);
        }

        const updatedSelected = state.selectedReport?.id === reportId ? null : state.selectedReport;
        saveReportsToStorage(updatedReports);

        return { 
          reports: updatedReports, 
          archivedReports: updatedArchived,
          selectedReport: updatedSelected 
        };
      });
    },

    addComment: (reportId, text, photoUrl) => {
      const authorId = getDeviceId();
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        authorId,
        text,
        photoUrl,
        createdAt: formatIndonesiaTimestamp(),
        likes: 0,
      };

      set((state) => {
        const updatedReports = state.reports.map((r) => {
          if (r.id === reportId) {
            const comments = r.comments || [];
            return {
              ...r,
              comments: [newComment, ...comments],
              commentsCount: (r.commentsCount || 0) + 1,
            };
          }
          return r;
        });

        const updatedSelected = state.selectedReport?.id === reportId
          ? updatedReports.find((r) => r.id === reportId) || null
          : state.selectedReport;

        saveReportsToStorage(updatedReports);
        return { reports: updatedReports, selectedReport: updatedSelected };
      });
    },

    toggleUpvote: (reportId) => {
      set((state) => {
        const updatedReports = state.reports.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              upvotes: r.upvotes + 1,
              validationsCount: r.validationsCount + 1,
            };
          }
          return r;
        });

        const updatedSelected = state.selectedReport?.id === reportId
          ? updatedReports.find((r) => r.id === reportId) || null
          : state.selectedReport;

        saveReportsToStorage(updatedReports);
        return { reports: updatedReports, selectedReport: updatedSelected };
      });
    },

    handleValidation: (reportId: string, type: 'valid' | 'invalid') => {
      const deviceId = getDeviceId();
      set((state) => {
        const updatedReports = state.reports.map((report) => {
          if (report.id !== reportId) return report;

          let newVotedBy = [...(report.votedBy || [])];
          let newInvalidatedBy = [...(report.invalidatedBy || [])];
          let newValidCount = report.validationsCount || 0;
          let newInvalidCount = report.invalidationsCount || 0;

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
            ...report,
            votedBy: newVotedBy,
            invalidatedBy: newInvalidatedBy,
            validationsCount: Math.max(0, newValidCount),
            invalidationsCount: Math.max(0, newInvalidCount),
          };
        });

        const updatedSelected = state.selectedReport?.id === reportId
          ? updatedReports.find((r) => r.id === reportId) || null
          : state.selectedReport;

        saveReportsToStorage(updatedReports);
        return { reports: updatedReports, selectedReport: updatedSelected };
      });
    },

    updateReportStatus: (reportId: string, status: ReportStatus) => {
      set((state) => {
        const updatedReports = state.reports.map((report) => {
          if (report.id !== reportId) return report;
          const updatedTimeline = [
            ...(report.timeline || []),
            {
              id: `t-${Date.now()}`,
              title: `Status Diperbarui: ${status}`,
              time: formatIndonesiaTimestamp(),
              status,
              description: 'Status laporan telah diperbarui oleh Petugas BPBD.'
            }
          ];
          return {
            ...report,
            status,
            timeline: updatedTimeline
          };
        });

        const updatedSelected = state.selectedReport?.id === reportId
          ? updatedReports.find((r) => r.id === reportId) || null
          : state.selectedReport;

        saveReportsToStorage(updatedReports);
        return { reports: updatedReports, selectedReport: updatedSelected };
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
        timestamp: formatIndonesiaTimestamp(),
        read: false
      };
      set((state) => ({
        notifications: [newNotif, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
    },

    exportReportsJSON: () => {
      const reports = get().reports;
      const jsonStr = JSON.stringify(reports, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gosiaga_reports_backup_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },

    importReportsJSON: (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          set({ reports: parsed });
          saveReportsToStorage(parsed);
          alert(`Berhasil mengimpor ${parsed.length} data laporan bencana ke Vercel/Browser!`);
          return true;
        }
      } catch {
        alert('File JSON tidak valid atau format rusak.');
      }
      return false;
    }
  };
});