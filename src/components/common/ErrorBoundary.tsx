import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center mb-4 text-red-500 text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Terjadi Kesalahan Aplikasi</h2>
          <p className="text-slate-400 text-xs mb-4 max-w-md">
            Peta atau komponen mengalami kendala render.
          </p>
          <code className="bg-slate-800 p-3 rounded-xl text-[11px] text-red-300 mb-6 max-w-lg overflow-auto border border-slate-700">
            {this.state.errorMsg}
          </code>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/30"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}