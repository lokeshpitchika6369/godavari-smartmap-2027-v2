import React, { useState } from 'react';
import { Language, MainSection } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Map as MapIcon,
  MapPin,
  FileText,
  BookOpen,
  UserX,
  UserCheck,
  Flame,
  AlertTriangle,
  X,
  ChevronRight,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentSection: MainSection;
  currentLanguage: Language;
  isPlacesDrawerOpen: boolean;
  onOpenPlacesDrawer: () => void;
  onSelectSection: (section: MainSection) => void;
  onOpenCrowdReport: () => void;
  isMobileHome?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentSection,
  currentLanguage,
  isPlacesDrawerOpen,
  onOpenPlacesDrawer,
  onSelectSection,
  onOpenCrowdReport,
  isMobileHome = false,
}) => {
  const t = translations[currentLanguage];
  const [isReportsSheetOpen, setIsReportsSheetOpen] = useState<boolean>(false);

  // Tab labels with localized fallbacks
  const labels = {
    map: { en: 'Map', te: 'మ్యాప్', hi: 'मानचित्र' }[currentLanguage] || 'Map',
    places: t.nav.places || 'Places',
    reports: { en: 'Reports', te: 'నివేదికలు', hi: 'रिपोर्ट्स' }[currentLanguage] || 'Reports',
    guidelines: { en: 'Guidelines', te: 'మార్గదర్శకాలు', hi: 'मार्गदर्शिका' }[currentLanguage] || 'Guidelines',
  };

  const isMapActive = !isMobileHome && currentSection === 'places' && !isPlacesDrawerOpen && !isReportsSheetOpen;
  const isPlacesActive = !isMobileHome && currentSection === 'places' && isPlacesDrawerOpen && !isReportsSheetOpen;
  const isReportsActive = !isMobileHome && (isReportsSheetOpen || currentSection === 'report_missing' || currentSection === 'found_missing' || currentSection === 'report_emergency');
  const isGuidelinesActive = !isMobileHome && currentSection === 'dos_donts' && !isReportsSheetOpen;

  const handleTabClick = (tab: 'map' | 'places' | 'reports' | 'guidelines') => {
    switch (tab) {
      case 'map':
        setIsReportsSheetOpen(false);
        onSelectSection('places');
        break;
      case 'places':
        setIsReportsSheetOpen(false);
        onOpenPlacesDrawer();
        break;
      case 'reports':
        setIsReportsSheetOpen(!isReportsSheetOpen);
        break;
      case 'guidelines':
        setIsReportsSheetOpen(false);
        onSelectSection('dos_donts');
        break;
    }
  };

  return (
    <>
      {/* Slide-Up Mobile Reports Hub Modal */}
      {isReportsSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsReportsSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-slate-900 border-t-2 border-amber-500 rounded-t-2xl shadow-2xl p-4 space-y-3 z-10 max-h-[80vh] overflow-y-auto mb-14">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {currentLanguage === 'te'
                    ? 'పౌర నివేదికలు & సేవా కేంద్రాలు'
                    : currentLanguage === 'hi'
                    ? 'नागरिक रिपोर्ट एवं सहायता केंद्र'
                    : 'Pushkaralu Civic Reports'}
                </h3>
              </div>
              <button
                onClick={() => setIsReportsSheetOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Close reports menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* 1. Missing Person Report */}
              <button
                onClick={() => {
                  setIsReportsSheetOpen(false);
                  onSelectSection('report_missing');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      {t.nav.reportMissing}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentLanguage === 'te'
                        ? 'తప్పిపోయిన వారి వివరాలు నమోదు చేయండి'
                        : currentLanguage === 'hi'
                        ? 'लापता व्यक्ति की रिपोर्ट दर्ज करें'
                        : 'Register missing pilgrim with Lost & Found Cell'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
              </button>

              {/* 2. Found Person Report */}
              <button
                onClick={() => {
                  setIsReportsSheetOpen(false);
                  onSelectSection('found_missing');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      {t.nav.foundMissing}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentLanguage === 'te'
                        ? 'కనిపించిన వ్యక్తుల సమాచారం అందించండి'
                        : currentLanguage === 'hi'
                        ? 'मिले हुए व्यक्ति की सूचना दर्ज करें'
                        : 'Report sheltered or unaccompanied pilgrim'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </button>

              {/* 3. Live Crowd Density Report */}
              <button
                onClick={() => {
                  setIsReportsSheetOpen(false);
                  onOpenCrowdReport();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-orange-500/30 hover:border-orange-500 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-orange-300">
                      {currentLanguage === 'te'
                        ? 'రద్దీ సాంద్రత నివేదిక'
                        : currentLanguage === 'hi'
                        ? 'लाइव भीड़ घनत्व रिपोर्ट'
                        : 'Report Crowd Density'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentLanguage === 'te'
                        ? 'ఘాట్ వద్ద రద్దీ స్థాయిని లైవ్‌గా నివేదించండి'
                        : currentLanguage === 'hi'
                        ? 'घाट पर वास्तविक भीड़ स्तर की रिपोर्ट करें'
                        : 'Submit real-time crowd congestion rating & photo'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400" />
              </button>

              {/* 4. Emergency Report & Hotlines */}
              <button
                onClick={() => {
                  setIsReportsSheetOpen(false);
                  onSelectSection('report_emergency');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-red-500/30 hover:border-red-500 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-red-300">
                      {t.nav.reportEmergency}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentLanguage === 'te'
                        ? '112 / 108 కంట్రోల్ రూమ్ & అత్యవసర సేవలు'
                        : currentLanguage === 'hi'
                        ? '112 / 108 कंट्रोल रूम एवं आपातकालीन सेवा'
                        : '24/7 Police, NDRF, Medical & 112 Control Room'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 shadow-2xl select-none"
        aria-label="Mobile Navigation"
      >
        {/* Tab 1: Map */}
        <button
          onClick={() => handleTabClick('map')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            isMapActive
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label={labels.map}
          aria-current={isMapActive ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg ${isMapActive ? 'bg-amber-500/20' : ''}`}>
            <MapIcon className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">{labels.map}</span>
        </button>

        {/* Tab 2: Places */}
        <button
          onClick={() => handleTabClick('places')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            isPlacesActive
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label={labels.places}
          aria-current={isPlacesActive ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg ${isPlacesActive ? 'bg-amber-500/20' : ''}`}>
            <MapPin className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">{labels.places}</span>
        </button>

        {/* Tab 3: Reports */}
        <button
          onClick={() => handleTabClick('reports')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
            isReportsActive
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label={labels.reports}
          aria-current={isReportsActive ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg ${isReportsActive ? 'bg-amber-500/20' : ''}`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">{labels.reports}</span>
          {isReportsSheetOpen && (
            <span className="absolute top-1 right-5 w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Tab 4: Guidelines (Do's & Don'ts) */}
        <button
          onClick={() => handleTabClick('guidelines')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            isGuidelinesActive
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label={labels.guidelines}
          aria-current={isGuidelinesActive ? 'page' : undefined}
        >
          <div className={`p-1 rounded-lg ${isGuidelinesActive ? 'bg-amber-500/20' : ''}`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">{labels.guidelines}</span>
        </button>
      </nav>
    </>
  );
};
