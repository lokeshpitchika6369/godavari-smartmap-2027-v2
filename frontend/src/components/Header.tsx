import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Globe, Shield } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenHome?: () => void;
  isMobileHome?: boolean;
  onOpenEmergencySos?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenHome,
  isMobileHome = false,
  onOpenEmergencySos,
}) => {
  const t = translations[currentLanguage];

  return (
    <header className="w-full bg-emerald-900 text-white border-b-2 md:border-b-4 border-amber-500 shadow-md">
      <div className="w-full px-3 py-2 md:px-4 md:py-2.5 flex flex-row items-center justify-between">
        {/* Left: Title, Subtitle, and Gov Badge */}
        <div className="flex items-center space-x-2 md:space-x-3 min-w-0 md:w-[65%] mb-0">
          <div className="bg-amber-500 text-emerald-950 p-1.5 md:p-2 rounded-lg font-bold flex items-center justify-center shadow-inner flex-shrink-0">
            <Shield className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 md:space-x-2 flex-nowrap md:flex-wrap">
              <h1 className="text-sm sm:text-base md:text-2xl font-black tracking-tight md:tracking-wide uppercase text-amber-300 truncate">
                {t.header.title}
              </h1>
              <span className="hidden sm:inline-block text-[10px] md:text-xs bg-emerald-800 text-amber-200 px-1.5 py-0.5 md:px-2 rounded border border-emerald-700 font-semibold whitespace-nowrap">
                {t.header.challengeTag}
              </span>
            </div>
            <p className="hidden md:block text-xs text-emerald-100 font-medium tracking-normal">
              {t.header.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Home Button, Mobile 112 SOS Button & Language Selector */}
        <div className="flex items-center justify-end space-x-1.5 md:space-x-2 flex-shrink-0 md:w-[35%]">
          {!isMobileHome && onOpenHome && (
            <button
              onClick={onOpenHome}
              className="md:hidden flex items-center space-x-1 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all active:scale-95"
              aria-label="Return to Visitor Home Dashboard"
            >
              <span>🏠 Home</span>
            </button>
          )}

          {/* Compact Mobile 112 SOS Control (Opens Emergency SOS Modal) */}
          {onOpenEmergencySos && (
            <button
              onClick={onOpenEmergencySos}
              className="md:hidden flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs rounded-lg shadow-md border border-red-300 transition-all active:scale-95 animate-pulse"
              aria-label="Emergency SOS - 112"
              title="Emergency SOS - 112"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-0.5" />
              <span>🚨 112 SOS</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 md:space-x-2 bg-emerald-800/80 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-emerald-700 shadow-sm">
            <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 flex-shrink-0" />
            <span className="hidden md:inline text-xs text-emerald-200 font-medium">
              {t.header.selectLanguage}:
            </span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-emerald-950 text-white font-semibold text-xs md:text-sm rounded px-2 py-1 md:px-3 border border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              aria-label={t.header.selectLanguage}
            >
              <option value="en">English</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
