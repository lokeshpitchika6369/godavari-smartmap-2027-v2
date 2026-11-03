import React, { useMemo } from 'react';
import { Facility, Language, UserLocation } from '../../types';
import { translations } from '../../i18n/translations';
import {
  X,
  MapPin,
  ShieldCheck,
  Compass,
  Store,
  Navigation,
  QrCode,
} from 'lucide-react';

interface FacilityDetailModalProps {
  facility: Facility | null;
  currentLanguage: Language;
  onClose: () => void;
  onFocusModel: (facility: Facility) => void;
  onStartRoute: (facility: Facility) => void;
  onViewQrCode: (facility: Facility) => void;
  userLocation?: UserLocation | null;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  facility,
  currentLanguage,
  onClose,
  onFocusModel,
  onStartRoute,
  onViewQrCode,
  userLocation,
}) => {
  if (!facility) return null;

  const t = translations[currentLanguage];

  // Calculate distance & estimated walk time if user location is available
  const distanceInfo = useMemo(() => {
    if (!userLocation || !facility) return null;
    const R = 6371e3;
    const φ1 = (userLocation.lat * Math.PI) / 180;
    const φ2 = (facility.coordinates[0] * Math.PI) / 180;
    const Δφ = ((facility.coordinates[0] - userLocation.lat) * Math.PI) / 180;
    const Δλ = ((facility.coordinates[1] - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distM = Math.round(R * c);
    const walkMins = Math.max(1, Math.round(distM / (1.2 * 60)));
    const formattedDist = distM < 1000 ? `${distM}m` : `${(distM / 1000).toFixed(1)}km`;
    return { distM, walkMins, formattedDist };
  }, [userLocation, facility]);

  const navigateLabel = {
    en: 'START WALKING NAVIGATION',
    te: 'నడక మార్గం ప్రారంభించండి',
    hi: 'पैदल नेविगेशन शुरू करें',
  }[currentLanguage] || 'START WALKING NAVIGATION';

  const closeLabel = {
    en: 'Close',
    te: 'మూసివేయి',
    hi: 'बंद करें',
  }[currentLanguage] || 'Close';

  const getStatusBadge = (status: Facility['verificationStatus']) => {
    switch (status) {
      case 'officially_verified':
        return {
          label: t.statuses.officially_verified,
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'historical_reference':
        return {
          label: t.statuses.historical_reference,
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'pending_verification':
        return {
          label: t.statuses.pending_verification,
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      case 'illustrative_sample':
      default:
        return {
          label: t.statuses.illustrative_sample,
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        };
    }
  };

  const statusInfo = getStatusBadge(facility.verificationStatus);

  return (
    <div
      data-testid="facility-detail-modal"
      className="fixed bottom-[68px] sm:bottom-[72px] left-3 right-3 sm:left-4 sm:right-4 md:absolute md:bottom-4 md:left-6 md:right-auto md:w-96 z-40 max-h-[58vh] md:max-h-[82vh] flex flex-col bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-amber-500/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 font-sans text-white pointer-events-auto"
    >
      {/* Top Banner: Desktop shows ID, Mobile shows Category & Close */}
      <div className="p-2.5 sm:p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          {facility.isStall ? (
            <Store className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wide truncate md:hidden">
            {t.places.categories[facility.category as keyof typeof t.places.categories] || facility.category}
          </span>
          <span className="hidden md:inline text-[11px] font-mono uppercase tracking-wider text-slate-300">
            ID: {facility.id}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {distanceInfo && (
            <span className="md:hidden text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
              ~{distanceInfo.formattedDist}
            </span>
          )}
          <button
            data-testid="close-facility-modal"
            onClick={onClose}
            className="flex items-center space-x-1 p-1 md:p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={closeLabel}
            title={closeLabel}
          >
            <span className="text-xs font-bold text-slate-300 hover:text-white md:hidden mr-0.5">✕</span>
            <X className="hidden md:block w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Details Body - Scrollable */}
      <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-y-auto flex-1 min-h-0">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white leading-snug">
            {facility.name[currentLanguage] || facility.name.en}
          </h3>
          <p className="hidden md:block text-xs font-semibold text-emerald-800 uppercase tracking-wide mt-0.5">
            {t.places.categories[facility.category as keyof typeof t.places.categories] || facility.category}
          </p>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:py-1 rounded-full border ${statusInfo.badgeClass}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{statusInfo.label}</span>
          </span>
          {facility.operationalStatus && (
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              ● {facility.operationalStatus}
            </span>
          )}
        </div>

        {/* Description: Clean, clamped on mobile if needed */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 line-clamp-3 md:line-clamp-none">
          {facility.description[currentLanguage] || facility.description.en}
        </p>

        {/* Geographic Coordinates Display (Desktop Only) */}
        <div className="hidden md:flex justify-between items-center text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
          <span>Coordinates:</span>
          <span className="text-white font-bold">
            {facility.coordinates[0].toFixed(4)}° N, {facility.coordinates[1].toFixed(4)}° E
          </span>
        </div>
      </div>

      {/* Pinned Action Footer: Always visible, never occluded */}
      <div className="p-3 sm:p-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
        <button
          data-testid="start-walking-nav-btn"
          onClick={() => onStartRoute(facility)}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all cursor-pointer ring-2 ring-emerald-300/40"
          aria-label={navigateLabel}
        >
          <Navigation className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span className="tracking-wide uppercase font-black">{navigateLabel}</span>
          {distanceInfo && (
            <span className="text-xs font-bold text-slate-900/80 ml-1 bg-emerald-300/60 px-1.5 py-0.5 rounded">
              {distanceInfo.formattedDist} • ~{distanceInfo.walkMins}m
            </span>
          )}
        </button>

        {/* Secondary Actions: Center 3D & View QR Code (Desktop Only) */}
        <div className="hidden md:grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onFocusModel(facility)}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Center 3D View</span>
          </button>

          <button
            onClick={() => onViewQrCode(facility)}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>Facility QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
