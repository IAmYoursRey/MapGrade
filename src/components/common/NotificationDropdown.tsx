import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore'; 

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { reports = [], setSelectedReport, setSelectedReportId, setIsDrawerOpen } = useMapStore();

  const activeNotifications = reports
    .filter(
      (report) =>
        report.status !== 'RESOLVED' &&
        report.status !== 'ARCHIVED' &&
        !readIds.includes(report.id)
    )
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const unreadCount = activeNotifications.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadIds((prev) => [...prev, id]);
  };

  const markAllAsRead = () => {
    const allActiveIds = activeNotifications.map((r) => r.id);
    setReadIds((prev) => [...prev, ...allActiveIds]);
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setIsOpen(false);

    const foundReport = reports.find((r) => r.id === id);
    if (foundReport && typeof setSelectedReport === 'function') {
      setSelectedReport(foundReport);
    } else if (typeof setSelectedReportId === 'function') {
      setSelectedReportId(id);
    }

    if (typeof setIsDrawerOpen === 'function') {
      setIsDrawerOpen(true);
    }

    const currentPath = window.location.pathname;
    if (!currentPath.includes('/analytics/heatmap') && !currentPath.includes('/dashboard') && !currentPath.includes('/map')) {
      navigate('/dashboard/bpbd');
    }
  };

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'kebakaran':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'banjir':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'gempa':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      { }
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        
        { }
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 border-2 border-white dark:border-slate-800 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      { }
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Notifikasi Masuk
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs">
                {unreadCount} Baru
              </span>
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {activeNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-500/50" />
                <p className="text-sm font-medium">Yeay! Semua laporan sudah ditangani atau dibaca.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {activeNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group flex gap-3 relative"
                  >
                    { }
                    <div className="shrink-0 mt-0.5 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg h-fit group-hover:scale-110 transition-transform">
                      {getIcon(notification.category)}
                    </div>
                    
                    { }
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.description}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 block">
                        {notification.createdAt || 'Baru saja'}
                      </span>
                    </div>

                    { }
                    <button
                      type="button"
                      onClick={(e) => markAsRead(notification.id, e)}
                      className="absolute right-4 top-4 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                      title="Tandai dibaca & sembunyikan"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Notifikasi otomatis hilang jika status laporan diselesaikan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};