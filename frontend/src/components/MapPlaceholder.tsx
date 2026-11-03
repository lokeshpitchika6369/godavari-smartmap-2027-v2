import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Layers, Compass, Navigation, Search, Info } from 'lucide-react';

interface MapPlaceholderProps {
  currentLanguage: Language;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ currentLanguage }) => {
  const t = translations[currentLanguage];
  const [mapMode, setMapMode] = useState<'3D' | '2D'>('3D');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: t.places.allCategories },
    { id: 'ghats', label: t.places.categories.ghats },
    { id: 'temples', label: t.places.categories.temples },
    { id: 'medical', label: t.places.categories.medical },
    { id: 'water', label: t.places.categories.water },
    { id: 'toilets', label: t.places.categories.toilets },
    { id: 'foodStalls', label: t.places.categories.foodStalls },
    { id: 'poojaStalls', label: t.places.categories.poojaStalls },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80 shadow-lg">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.places.searchPlaceholder}
            className="w-full bg-slate-800/90 backdrop-blur-md text-white text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
          />
        </div>

        {/* 2D / 3D Toggle & Controls */}
        <div className="flex items-center space-x-2 bg-slate-800/90 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg">
          <button
            onClick={() => setMapMode('3D')}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center space-x-1 transition-colors ${
              mapMode === '3D'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.map.mode3D}</span>
          </button>
          <button
            onClick={() => setMapMode('2D')}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center space-x-1 transition-colors ${
              mapMode === '2D'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>{t.map.mode2D}</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="absolute top-16 left-3 right-3 z-10 flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-md ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 border border-amber-400'
                : 'bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Map View Area (Phase 2 Foundation Visualizer) */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-800 via-slate-900 to-slate-950">
        <div className="max-w-md p-6 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{t.map.title}</h3>
          <p className="text-xs text-slate-300 mb-4">{t.map.subtext}</p>

          <div className="p-3 bg-slate-900/90 rounded-lg text-left text-xs border border-slate-800 mb-4 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Center Target:</span>
              <span className="font-mono text-amber-300">17.0005° N, 81.7800° E</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Key Landmarks:</span>
              <span className="text-slate-200">Kotilingala Ghat, Pushkar Ghat</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Rendering Mode:</span>
              <span className="text-amber-400 font-bold">{mapMode} Mode</span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-950/60 border border-amber-700/60 rounded-full text-[11px] text-amber-200 font-medium">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Phase 2 Foundation Ready for MapLibre & Three.js 3D Models</span>
          </div>
        </div>
      </div>

      {/* Floating GPS Button */}
      <button
        className="absolute bottom-16 right-4 z-10 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
        title={t.map.currentLocation}
      >
        <Navigation className="w-5 h-5" />
      </button>

      {/* Honest Illustrative Notice at bottom of map */}
      <div className="w-full bg-slate-950/90 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex items-center space-x-2">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span className="line-clamp-1">{t.map.illustrativeNotice}</span>
      </div>
    </div>
  );
};
