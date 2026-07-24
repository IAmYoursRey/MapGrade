import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDeviceId } from '@/utils/deviceId';

export type ReportStatus = 'UNVERIFIED' | 'VERIFIED_CROWD' | 'NEEDS_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
export type MapLayerType = 'dark' | 'streets' | 'satellite' | 'heatmap' | 'DARK' | 'STREET' | 'SATELLITE';

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  mediaUrl?: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
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
  validVotes: number;
  invalidVotes: number;
  createdAt: string;
  reporterName: string;
  mediaUrl?: string;
  videoUrl?: string;
  victimCount?: string;
  comments: CommentItem[];
  timeline: TimelineEvent[];
}

interface MapStore {
  reports: Report[];
  selectedReport: Report | null;
  selectedReportId: string | null;
  activeLayer: MapLayerType;
  filterCategory: string;
  activeCategory: string;
  isCreateModalOpen: boolean;
  isNotificationOpen: boolean;
  
  // Actions
  setSelectedReport: (report: Report | null) => void;
  setSelectedReportId: (id: string | null) => void;
  setActiveLayer: (layer: MapLayerType) => void;
  setFilterCategory: (category: string) => void;
  setActiveCategory: (category: string) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setNotificationOpen: (isOpen: boolean) => void;
  
  addReport: (newReport: Omit<Report, 'id' | 'createdAt' | 'validVotes' | 'invalidVotes' | 'status' | 'comments' | 'timeline'>) => void;
  addComment: (reportId: string, text: string, mediaUrl?: string) => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  voteReport: (reportId: string, isValid: boolean) => void;
}

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      reports: [
        {
          id: 'rep-1',
          title: 'Banjir Luapan Sungai Ahmad Yani',
          category: 'BANJIR',
          description: 'Ketinggian air mencapai 60cm akibat hujan deras sejak pagi.',
          latitude: -7.2891,
          longitude: 112.7344,
          status: 'UNVERIFIED',
          validVotes: 12,
          invalidVotes: 1,
          createdAt: new Date(Date.now() - 3000000).toISOString(),
          reporterName: 'Reporter #8812',
          comments: [
            { id: 'c-1', author: 'Reporter #4821', text: 'Air mulai masuk ke pemukiman RT 04.', createdAt: '10 menit lalu' }
          ],
          timeline: [
            { time: '13:20', title: 'Laporan Dibuat', description: 'Warga melaporkan genangan air.' }
          ]
        },
        {
          id: 'rep-2',
          title: 'Pohon Tumbang Menutup Jalan',
          category: 'POHON_TUMBANG',
          description: 'Akses kendaraan roda 4 terputus total.',
          latitude: -7.2758,
          longitude: 112.7481,
          status: 'IN_PROGRESS',
          validVotes: 34,
          invalidVotes: 0,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          reporterName: 'Relawan #102',
          comments: [],
          timeline: [
            { time: '11:00', title: 'Laporan Dibuat', description: 'Pohon tumbang akibat angin kencang.' },
            { time: '11:30', title: 'Tim BPBD Meluncur', description: 'Tim evakuasi membawa gergaji mesin.' }
          ]
        }
      ],
      selectedReport: null,
      selectedReportId: null,
      activeLayer: 'dark',
      filterCategory: 'ALL',
      activeCategory: 'ALL',
      isCreateModalOpen: false,
      isNotificationOpen: false,

      setSelectedReport: (report) => set({ 
        selectedReport: report, 
        selectedReportId: report ? report.id : null 
      }),
      setSelectedReportId: (id) => set((state) => ({
        selectedReportId: id,
        selectedReport: id ? state.reports.find((r) => r.id === id) || null : null
      })),
      setActiveLayer: (layer) => set({ activeLayer: layer }),
      setFilterCategory: (category) => set({ filterCategory: category, activeCategory: category }),
      setActiveCategory: (category) => set({ filterCategory: category, activeCategory: category }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
      setNotificationOpen: (isOpen) => set({ isNotificationOpen: isOpen }),

      addReport: (data) => {
        const newReport: Report = {
          ...data,
          id: `rep-${Date.now()}`,
          status: 'UNVERIFIED',
          validVotes: 1,
          invalidVotes: 0,
          createdAt: new Date().toISOString(),
          comments: [],
          timeline: [
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: 'Laporan Dibuat',
              description: 'Laporan telah terdaftar di sistem GoSiaga.'
            }
          ]
        };

        set((state) => ({
          reports: [newReport, ...state.reports],
          selectedReport: newReport,
          selectedReportId: newReport.id,
          isCreateModalOpen: false
        }));
      },

      addComment: (reportId, text, mediaUrl) => {
        const deviceId = getDeviceId();
        const newComment: CommentItem = {
          id: `c-${Date.now()}`,
          author: deviceId,
          text,
          mediaUrl,
          createdAt: 'Baru saja'
        };

        set((state) => {
          const updatedReports = state.reports.map((r) => {
            if (r.id === reportId) {
              return {
                ...r,
                comments: [...r.comments, newComment]
              };
            }
            return r;
          });

          const currentSelected = state.selectedReport?.id === reportId 
            ? updatedReports.find(r => r.id === reportId) || null 
            : state.selectedReport;

          return { reports: updatedReports, selectedReport: currentSelected };
        });
      },

      updateReportStatus: (reportId, newStatus) => {
        set((state) => {
          const statusLabels: Record<ReportStatus, string> = {
            UNVERIFIED: 'Belum Diverifikasi',
            VERIFIED_CROWD: 'Diverifikasi Warga',
            NEEDS_REVIEW: 'Perlu Investigasi',
            IN_PROGRESS: 'Penanganan BPBD',
            RESOLVED: 'Selesai / Teratasi',
            ARCHIVED: 'Diarsipkan'
          };

          const updatedReports = state.reports.map((r) => {
            if (r.id === reportId) {
              const newTimelineEvent = {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: `Status: ${statusLabels[newStatus]}`,
                description: `Perubahan status oleh Komando BPBD.`
              };
              return {
                ...r,
                status: newStatus,
                timeline: [newTimelineEvent, ...r.timeline]
              };
            }
            return r;
          });

          const currentSelected = state.selectedReport?.id === reportId 
            ? updatedReports.find(r => r.id === reportId) || null 
            : state.selectedReport;

          return { reports: updatedReports, selectedReport: currentSelected };
        });
      },

      voteReport: (reportId, isValid) => {
        set((state) => {
          const updatedReports = state.reports.map((r) => {
            if (r.id === reportId) {
              return {
                ...r,
                validVotes: isValid ? r.validVotes + 1 : r.validVotes,
                invalidVotes: !isValid ? r.invalidVotes + 1 : r.invalidVotes
              };
            }
            return r;
          });
          return { reports: updatedReports };
        });
      }
    }),
    {
      name: 'gosiaga-reactive-storage'
    }
  )
);