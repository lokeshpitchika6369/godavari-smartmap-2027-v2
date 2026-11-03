import React, { useState } from 'react';
import { MainSection, Language, Facility } from '../types';
import { translations } from '../i18n/translations';
import { PlacesDirectory } from './places/PlacesDirectory';
import {
  MapPin,
  UserX,
  UserCheck,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  ListFilter,
  Layers,
} from 'lucide-react';

interface ServicePanelProps {
  currentSection: MainSection;
  onSelectSection: (section: MainSection) => void;
  currentLanguage: Language;
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
  activeCategoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  onStartRoute?: (facility: Facility) => void;
  onViewQrCode?: (facility: Facility) => void;
}

export const ServicePanel: React.FC<ServicePanelProps> = ({
  currentSection,
  onSelectSection,
  currentLanguage,
  facilities,
  selectedFacility,
  onSelectFacility,
  activeCategoryFilter,
  onCategoryFilterChange,
  onStartRoute,
  onViewQrCode,
}) => {
  const t = translations[currentLanguage];
  const [panelTab, setPanelTab] = useState<'directory' | 'services'>('directory');

  const navItems = [
    {
      id: 'places' as MainSection,
      label: t.nav.places,
      icon: MapPin,
      badge: 'GIS 3D',
      badgeColor: 'bg-blue-100 text-blue-800',
      activeColor: 'border-blue-600 bg-blue-50/80',
    },
    {
      id: 'report_missing' as MainSection,
      label: t.nav.reportMissing,
      icon: UserX,
      badge: 'Help Cell',
      badgeColor: 'bg-amber-100 text-amber-800',
      activeColor: 'border-amber-600 bg-amber-50/80',
    },
    {
      id: 'found_missing' as MainSection,
      label: t.nav.foundMissing,
      icon: UserCheck,
      badge: 'Reunite',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      activeColor: 'border-emerald-600 bg-emerald-50/80',
    },
    {
      id: 'report_emergency' as MainSection,
      label: t.nav.reportEmergency,
      icon: AlertTriangle,
      badge: 'Urgent',
      badgeColor: 'bg-red-100 text-red-800',
      activeColor: 'border-red-600 bg-red-50/80',
    },
    {
      id: 'dos_donts' as MainSection,
      label: t.nav.dosDonts,
      icon: BookOpen,
      badge: 'Safety',
      badgeColor: 'bg-purple-100 text-purple-800',
      activeColor: 'border-purple-600 bg-purple-50/80',
    },
  ];

  return (
    <aside className="w-full h-full bg-slate-50 border-l border-slate-200 flex flex-col shadow-sm overflow-hidden font-sans">
      {/* Service Header & Tab Switcher */}
      <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pushkaralu 2027
          </h2>
          <p className="text-sm font-extrabold text-slate-800">
            Civic Portal & Directory
          </p>
        </div>

        {/* Tab switch between Places Directory and Main Portals */}
        <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300">
          <button
            onClick={() => setPanelTab('directory')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1 ${
              panelTab === 'directory'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Places</span>
          </button>
          <button
            onClick={() => setPanelTab('services')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1 ${
              panelTab === 'services'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>
        </div>
      </div>

      {/* Main Content inside Service Panel */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {panelTab === 'directory' ? (
          <PlacesDirectory
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={onSelectFacility}
            currentLanguage={currentLanguage}
            activeCategoryFilter={activeCategoryFilter}
            onCategoryFilterChange={onCategoryFilterChange}
            onStartRoute={onStartRoute}
            onViewQrCode={onViewQrCode}
          />
        ) : (
          <nav className="p-3 space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-center justify-between group ${
                    isActive
                      ? `${item.activeColor} shadow-sm font-bold text-slate-900 border-2`
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-md ${
                        isActive
                          ? 'bg-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-white'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          item.id === 'report_emergency'
                            ? 'text-red-600'
                            : item.id === 'places'
                            ? 'text-blue-600'
                            : item.id === 'report_missing'
                            ? 'text-amber-600'
                            : item.id === 'found_missing'
                            ? 'text-emerald-600'
                            : 'text-purple-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400">0{index + 1}.</span>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-1 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isActive ? 'translate-x-1 text-slate-800' : 'group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Emergency Quick Hotlines Footer */}
      <div className="p-3 bg-red-50/80 border-t border-red-200 m-2 rounded-xl flex-shrink-0">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-extrabold text-red-900 uppercase tracking-wide flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Direct Emergency Dial</span>
          </span>
          <span className="text-[10px] text-red-700 font-semibold">Toll-Free</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:112"
            className="flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg text-center shadow-sm"
          >
            <span>Dial 112 (Police)</span>
          </a>
          <a
            href="tel:108"
            className="flex items-center justify-center space-x-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg text-center shadow-sm"
          >
            <span>Dial 108 (Ambulance)</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
