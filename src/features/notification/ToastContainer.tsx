import React from 'react';
import { useNotificationStore, ToastType, ToastItem } from '@/store/useNotificationStore';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const toastConfig: Record<ToastType, { icon: React.ElementType; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: AlertCircle, bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-600 dark:text-red-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-600 dark:text-amber-400' },
  info: { icon: Info, bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30', text: 'text-blue-600 dark:text-blue-400' },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      {toasts.map((toast: ToastItem) => {
        const Config = toastConfig[toast.type] || toastConfig.info;
        const Icon = Config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-xl transition-all animate-in slide-in-from-top-5 fade-in duration-300 ${Config.bg} ${Config.border}`}
          >
            <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${Config.text}`} />
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${Config.text}`}>{toast.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
};