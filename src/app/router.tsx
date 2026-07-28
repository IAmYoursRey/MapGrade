import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LandingPage } from '@/pages/LandingPage';
import { MapPage } from '@/pages/MapPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { BpbdDashboard } from '@/pages/dashboard/BpbdDashboard';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

const ProfilePage = () => <div className="p-8 text-center text-slate-500 font-bold">Halaman Profil (Dalam Pengembangan)</div>;
const CitizenDashboard = () => <div className="p-8 text-center text-slate-500 font-bold">Dashboard Warga (Dalam Pengembangan)</div>;
const AdminDashboard = () => <div className="p-8 text-center text-slate-500 font-bold">Dashboard Admin Sistem (Dalam Pengembangan)</div>;
const DocsPage = () => <div className="p-8 text-center text-slate-500 font-bold">Silakan merujuk pada file README.md di Repositori GitHub.</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Terjadi Kesalahan Aplikasi</h1>
        <p className="mt-2 text-slate-400 text-sm">Terjadi kesalahan tak terduga. Silakan muat ulang halaman.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-red-700 transition-all"
        >
          Muat Ulang Halaman
        </button>
      </div>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      { path: 'docs', element: <DocsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: 'bpbd', element: <BpbdDashboard /> },
      { path: 'citizen', element: <CitizenDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
    ],
  },
  {
    path: '/analytics/heatmap',
    element: <AnalyticsPage />,
  },
  { 
    path: '*', 
    element: <Navigate to="/" replace /> 
  },
]);