import React from 'react';
import { Flame, Waves, Wind, Mountain, Layers } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';

const categories = [
  { id: 'ALL', label: 'Semua Bencana', icon: Layers },
  { id: 'Kebakaran', label: 'Kebakaran', icon: Flame },
  { id: 'Banjir', label: 'Banjir', icon: Waves },
  { id: 'Gempa', label: 'Gempa Bumi', icon: Mountain },
  { id: 'Cuaca', label: 'Cuaca Ekstrem', icon: Wind },
];

export const CategoryFilterPills: React.FC = () => {
  const { activeCategory, setActiveCategory } = useMapStore();

  return (
    <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-3">
      <div className="flex flex-col bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-xl max-w-fit">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 translate-x-2' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};