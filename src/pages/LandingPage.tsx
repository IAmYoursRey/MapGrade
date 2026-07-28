import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldAlert, Users, BrainCircuit, Globe2 } from 'lucide-react';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-semibold mb-4">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Mitigasi Bencana Real-time Indonesia</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Satu Laporan, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
              Selamatkan Banyak Nyawa
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mt-2">
            GoSiaga adalah peta interaktif berbasis partisipasi massa.
            Lapor kejadian darurat di sekitarmu, validasi informasi secara real-time, dan percepat langkah mitigasi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              to="/map"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <MapPin className="w-5 h-5 group-hover:animate-bounce" />
              Masuk ke Peta
            </Link>
            <Link
              to="/docs"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-all"
            >
              Pelajari Sistem
            </Link>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6 text-blue-500" />}
            value={<AnimatedCounter end={14520} />}
            label="Pelapor Aktif Terdaftar"
          />
          <StatCard
            icon={<ShieldAlert className="w-6 h-6 text-green-500" />}
            value={<AnimatedCounter end={3254} />}
            label="Insiden Berhasil Ditangani"
          />
          <StatCard
            icon={<Globe2 className="w-6 h-6 text-amber-500" />}
            value={<AnimatedCounter end={500} suffix="+" />}
            label="Radius Wilayah Terlindungi (KM)"
          />
        </div>
      </section>

      <section className="w-full bg-slate-100 dark:bg-slate-900/50 py-24 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Teknologi di Balik GoSiaga</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Dibangun dengan arsitektur modern untuk menjamin ketersediaan tinggi (High Availability) dan penyebaran informasi tanpa henti.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="w-8 h-8 text-red-500" />}
              title="Pemetaan Real-time"
              description="Titik laporan langsung menyala di peta seketika (via WebSockets) tanpa perlu memuat ulang layar. Terinspirasi dari eksplorasi Radio Garden."
            />
            <FeatureCard
              icon={<BrainCircuit className="w-8 h-8 text-blue-500" />}
              title="Kecerdasan Buatan (AI)"
              description="Dilengkapi AI yang merangkum ratusan komentar warga menjadi satu kesimpulan padat, serta menganalisis tingkat risiko bencana otomatis."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-green-500" />}
              title="Validasi Massa Berjenjang"
              description="Mekanisme pencegahan hoaks. Laporan diverifikasi langsung oleh warga di lokasi sebelum diteruskan ke dashboard BPBD."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; value: React.ReactNode; label: string }> = ({ icon, value, label }) => (
  <article className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl">
    <figure className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
      {icon}
    </figure>
    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</h3>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
  </article>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <article className="flex flex-col p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 shadow-lg">
    <figure className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 mb-6">
      {icon}
    </figure>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
      {description}
    </p>
  </article>
);