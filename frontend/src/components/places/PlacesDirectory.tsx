import React from 'react';
import { Facility, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { MapPin, Store, ShieldCheck, Compass, Filter, Navigation, QrCode } from 'lucide-react';

interface PlacesDirectoryProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
  currentLanguage: Language;
  activeCategoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  onStartRoute?: (facility: Facility) => void;
  onViewQrCode?: (facility: Facility) => void;
}

export const PlacesDirectory: React.FC<PlacesDirectoryProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  currentLanguage,
  activeCategoryFilter,
  onCategoryFilterChange,
  onStartRoute,
  onViewQrCode,
}) => {
  const t = translations[currentLanguage];

  const getStatusBadge = (status: Facility['verificationStatus']) => {
    switch (status) {
      case 'officially_verified':
        return {
          label: t.statuses.officially_verified,
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'historical_reference':
        return {
          label: t.statuses.historical_reference,
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'pending_verification':
        return {
          label: t.statuses.pending_verification,
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'illustrative_sample':
      default:
        return {
          label: t.statuses.illustrative_sample,
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Directory Header Bar */}
      <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {t.places.title} ({facilities.length})
          </span>
        </div>
        {activeCategoryFilter !== 'all' && (
          <button
            onClick={() => onCategoryFilterChange('all')}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Facilities Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {facilities.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 mb-1">{t.places.noResults}</p>
            <p>Try searching for a different term or selecting "All Categories".</p>
          </div>
        ) : (
          facilities.map((facility) => {
            const isSelected = selectedFacility?.id === facility.id;
            const statusInfo = getStatusBadge(facility.verificationStatus);

            return (
              <div
                key={facility.id}
                onClick={() => onSelectFacility(facility)}
                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 ${
                        facility.isStall
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {facility.isStall ? (
                        <Store className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {facility.name[currentLanguage] || facility.name.en}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {t.places.categories[facility.category as keyof typeof t.places.categories] ||
                          facility.category}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {facility.id}
                  </span>
                </div>

                {/* Badges & Actions Row */}
                <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border ${statusInfo.badgeClass} font-semibold`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{statusInfo.label}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    {onStartRoute && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartRoute(facility);
                        }}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                        title={t.navigation.routeToFacility}
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Route</span>
                      </button>
                    )}

                    {onViewQrCode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewQrCode(facility);
                        }}
                        className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 hover:bg-slate-200 transition-colors"
                        title={t.qr.viewQrBtn}
                      >
                        <QrCode className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFacility(facility);
                      }}
                      className="inline-flex items-center space-x-1 text-slate-700 hover:text-amber-600 font-bold"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t.places.viewOnMap}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
