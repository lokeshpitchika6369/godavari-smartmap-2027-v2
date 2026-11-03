import React from 'react';
import { Language, UserLocation } from '../../types';
import { translations } from '../../i18n/translations';
import { MANUAL_START_LANDMARKS, createManualStartingLocation, ManualLandmark } from '../../services/geolocationService';
import { X, MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

interface ManualOriginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onSelectOrigin: (location: UserLocation) => void;
  onRequestGps: () => void;
  gpsErrorMessage?: string;
}

export const ManualOriginModal: React.FC<ManualOriginModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectOrigin,
  onRequestGps,
  gpsErrorMessage,
}) => {
  if (!isOpen) return null;
  const t = translations[currentLanguage];

  const handleSelectLandmark = (landmark: ManualLandmark) => {
    const loc = createManualStartingLocation(landmark);
    onSelectOrigin(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-lg">{t.navigation.selectOriginTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-100 hover:text-white hover:bg-amber-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {gpsErrorMessage && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{gpsErrorMessage}</p>
                <p className="text-xs text-amber-700 mt-0.5">{t.gps.httpsRequirementNotice}</p>
              </div>
            </div>
          )}

          {/* Device GPS Button */}
          <button
            onClick={() => {
              onRequestGps();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>{t.navigation.useMyGps}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs uppercase font-bold text-slate-400">
              {t.navigation.orChooseLandmark}
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* List of Landmarks */}
          <div className="space-y-2">
            {MANUAL_START_LANDMARKS.map((landmark) => (
              <button
                key={landmark.id}
                onClick={() => handleSelectLandmark(landmark)}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800 group-hover:text-amber-900">
                      {landmark.name[currentLanguage] || landmark.name.en}
                    </div>
                    <div className="text-xs text-slate-500">
                      {landmark.coordinates[0].toFixed(4)}° N, {landmark.coordinates[1].toFixed(4)}° E
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
