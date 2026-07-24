import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Pages - Public & Citizen
import { LandingPage } from '@/pages/LandingPage';
import { MapPage } from '@/pages/MapPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Pages - Back Office & Analytics
import { BpbdDashboard } from '@/pages/dashboard/BpbdDashboard';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

// Placeholder untuk halaman ekspansi di masa depan (agar tidak error)
const ProfilePage = () => <div className="p-8 text-center text-slate-500 font-bold">Halaman Profil (Dalam Pengembangan)</div>;
const CitizenDashboard = () => <div className="p-8 text-center text-slate-500 font-bold">Dashboard Warga (Dalam Pengembangan)</div>;
const AdminDashboard = () => <div className="p-8 text-center text-slate-500 font-bold">Dashboard Admin Sistem (Dalam Pengembangan)</div>;
const DocsPage = () => <div className="p-8 text-center text-slate-500 font-bold">Silakan merujuk pada file README.md di Repositori GitHub.</div>;

export const router = createBrowserRouter([
  // RUTE PUBLIK & WARGA (Main Layout)
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      { path: 'docs', element: <DocsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  // RUTE BACK-OFFICE BPBD & ADMIN (Dashboard Layout)
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: 'bpbd', element: <BpbdDashboard /> },
      { path: 'citizen', element: <CitizenDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
    ],
  },
  // RUTE ANALITIK SPASIAL (Dashboard Layout)
  {
    path: '/analytics',
    element: <DashboardLayout />,
    children: [
      { path: 'heatmap', element: <AnalyticsPage /> },
    ],
  },
  // FALLBACK ROUTE (Jika URL tidak ditemukan, kembalikan ke Beranda)
  { 
    path: '*', 
    element: <Navigate to="/" replace /> 
  },
]);