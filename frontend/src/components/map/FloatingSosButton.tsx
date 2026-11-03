import React from 'react';
import { Language } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface FloatingSosButtonProps {
  currentLanguage: Language;
  onClick: () => void;
  isCardOpen?: boolean;
}

export const FloatingSosButton: React.FC<FloatingSosButtonProps> = ({
  currentLanguage,
  onClick,
  isCardOpen = false,
}) => {
  const labelText = {
    en: 'EMERGENCY SOS',
    te: 'అత్యవసర SOS',
    hi: 'आपातकालीन SOS',
  }[currentLanguage] || 'EMERGENCY SOS';

  const subLabel = {
    en: 'Dial 112 / 108 & Nearest Aid',
    te: '112 / 108 కాల్ & సమీప సహాయం',
    hi: '112 / 108 कॉल व निकटतम सहायता',
  }[currentLanguage] || 'Dial 112 / 108 & Nearest Aid';

  return (
    <div className={`hidden md:flex fixed ${isCardOpen ? 'bottom-[360px] md:bottom-6' : 'bottom-20 md:bottom-6'} right-3 sm:right-6 z-40 flex-col items-end pointer-events-auto transition-all duration-200`}>
      {/* Beacon Ping Ripple Animation */}
      <div className="relative">
        <span className="absolute -inset-1 rounded-full bg-red-500 opacity-75 animate-ping pointer-events-none" />
        <button
          onClick={onClick}
          className="relative group flex items-center space-x-2.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-red-200 ring-4 ring-red-500/40 hover:ring-red-500/70 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-150 cursor-pointer"
          aria-label={`${labelText} - ${subLabel}`}
          title={`${labelText}: Dial 112/108 & Find Nearest Aid`}
        >
          {/* Animated Emergency Beacon Icon */}
          <div className="relative flex items-center justify-center w-7 h-7 bg-white/20 rounded-full">
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
          </div>

          <div className="flex flex-col text-left leading-tight pr-1">
            <span className="text-sm sm:text-base tracking-wider font-extrabold uppercase drop-shadow">
              {labelText}
            </span>
            <span className="text-[10px] text-red-100 font-semibold tracking-tight hidden sm:inline-block">
              {subLabel}
            </span>
          </div>

          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping ml-1" />
        </button>
      </div>
    </div>
  );
};
