import React, { useState, useEffect, useMemo } from 'react';
import { Language, UserLocation, GeolocationStatus, Facility } from '../../types';
import { translations } from '../../i18n/translations';
import {
  detectNearestEmergencyAid,
  dispatchEmergencyAlertEvent,
  KNOWN_RIVERFRONT_LANDMARKS,
} from '../../services/emergencyProximity';
import {
  ShieldAlert,
  PhoneCall,
  Cross,
  Navigation,
  MapPin,
  Compass,
  AlertTriangle,
  X,
  VolumeX,
  Clock,
  Shield,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  userLocation: UserLocation | null;
  geolocationStatus: GeolocationStatus;
  onRequestLocation: () => void;
  facilities: Facility[];
  onStartRoute: (facility: Facility) => void;
  onOpenReportEmergency: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  userLocation,
  geolocationStatus,
  onRequestLocation,
  facilities,
  onStartRoute,
  onOpenReportEmergency,
}) => {
  const t = translations[currentLanguage];
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>('pushkar-ghat-central');

  // Trigger emergency alert event when modal opens to immediately mute any active audio guide (Phase 4.1 -> 4.4 hook)
  useEffect(() => {
    if (isOpen) {
      dispatchEmergencyAlertEvent({
        trigger: 'emergency_sos_modal_opened',
        hasLocation: Boolean(userLocation),
      });
    }
  }, [isOpen, userLocation]);

  // Determine effective coordinates for proximity resolution
  const { originCoords, locationSource, referenceLandmarkLabel } = useMemo(() => {
    if (userLocation && (userLocation.lat || userLocation.lng)) {
      return {
        originCoords: [userLocation.lat, userLocation.lng] as [number, number],
        locationSource: 'live_gps' as const,
        referenceLandmarkLabel: undefined,
      };
    }

    const landmark =
      KNOWN_RIVERFRONT_LANDMARKS.find((lm) => lm.id === selectedLandmarkId) ||
      KNOWN_RIVERFRONT_LANDMARKS[0];

    return {
      originCoords: landmark.coordinates,
      locationSource: 'manual_landmark' as const,
      referenceLandmarkLabel: landmark.name[currentLanguage] || landmark.name.en,
    };
  }, [userLocation, selectedLandmarkId, currentLanguage]);

  // Calculate nearest medical post and police helpdesk
  const proximityDetection = useMemo(() => {
    return detectNearestEmergencyAid(
      originCoords,
      facilities,
      locationSource,
      referenceLandmarkLabel
    );
  }, [originCoords, facilities, locationSource, referenceLandmarkLabel]);

  if (!isOpen) return null;

  const { nearestMedical, nearestPolice } = proximityDetection;

  const handleStartWalkRoute = (facility: Facility) => {
    dispatchEmergencyAlertEvent({
      trigger: 'emergency_route_started',
      facilityId: facility.id,
    });
    onStartRoute(facility);
    onClose();
  };

  const handleOpenDigitalReport = () => {
    onOpenReportEmergency();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-sos-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl text-white overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Top Emergency Header Bar */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 px-4 sm:px-6 py-4 flex items-center justify-between border-b-2 border-red-400">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl shadow-inner animate-pulse">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-red-950/80 text-amber-300 text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded tracking-wider border border-amber-400/40">
                  CRITICAL RESCUE
                </span>
                <span className="flex items-center space-x-1 text-[10px] sm:text-xs text-red-100 font-medium bg-red-900/60 px-2 py-0.5 rounded">
                  <VolumeX className="w-3 h-3 text-amber-300" />
                  <span>Audio Muted</span>
                </span>
              </div>
              <h2
                id="emergency-sos-modal-title"
                className="text-lg sm:text-2xl font-black tracking-wide uppercase text-white drop-shadow"
              >
                {t.emergency.sosModalTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-red-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label={t.emergency.closeButton}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Audio Guide Muted Priority Notice */}
          <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-3 flex items-center space-x-3 text-red-200 text-xs sm:text-sm">
            <VolumeX className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="leading-snug">
              {t.emergency.emergencyAudioMutedNotice}
            </p>
          </div>

          {/* SECTION 1: DIRECT CELLULAR DIAL TRIGGERS (112 & 108) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>{t.emergency.officialHotlinesTitle}</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Tap to Call Directly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dial 112: Police, Fire, National Emergency */}
              <a
                href="tel:112"
                onClick={() =>
                  dispatchEmergencyAlertEvent({ trigger: 'call_112_clicked' })
                }
                className="group flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white p-3.5 sm:p-4 rounded-xl border-2 border-red-300 shadow-lg transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-xl shadow-inner">
                    112
                  </div>
                  <div>
                    <div className="font-extrabold text-base sm:text-lg leading-tight flex items-center space-x-1.5">
                      <span>CALL 112</span>
                      <span className="text-[10px] bg-red-950 px-1.5 py-0.5 rounded font-black text-amber-300">
                        TOLL-FREE
                      </span>
                    </div>
                    <div className="text-[11px] text-red-100 font-medium leading-tight">
                      {t.emergency.call112Desc}
                    </div>
                  </div>
                </div>
                <PhoneCall className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
              </a>

              {/* Dial 108: Free Medical Ambulance */}
              <a
                href="tel:108"
                onClick={() =>
                  dispatchEmergencyAlertEvent({ trigger: 'call_108_clicked' })
                }
                className="group flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-95 text-white p-3.5 sm:p-4 rounded-xl border-2 border-amber-300 shadow-lg transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-xl shadow-inner">
                    108
                  </div>
                  <div>
                    <div className="font-extrabold text-base sm:text-lg leading-tight flex items-center space-x-1.5">
                      <span>CALL 108</span>
                      <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded font-black text-amber-300">
                        TOLL-FREE
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-100 font-medium leading-tight">
                      {t.emergency.call108Desc}
                    </div>
                  </div>
                </div>
                <PhoneCall className="w-5 h-5 text-amber-200 group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
              </a>
            </div>

            {/* On-Site Control Room Hotline */}
            <div className="mt-2.5">
              <a
                href="tel:+918832460100"
                onClick={() =>
                  dispatchEmergencyAlertEvent({ trigger: 'call_control_room_clicked' })
                }
                className="flex items-center justify-between bg-slate-800 hover:bg-slate-750 p-2.5 sm:p-3 rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold text-white">
                    {t.emergency.controlRoomDesc}:
                  </span>
                  <span className="font-bold text-amber-300 tracking-wider">
                    +91 883 2460100
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
                  On-Site Desk
                </span>
              </a>
            </div>
          </div>

          {/* SECTION 2: GPS STATUS & LOCATION-UNAVAILABLE FALLBACK */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                  Pilgrim Location Reference
                </span>
              </div>

              {locationSource === 'live_gps' ? (
                <div className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{t.emergency.locationStatusLive}</span>
                  {userLocation?.accuracy && (
                    <span className="text-[10px] text-emerald-400/80">
                      (±{Math.round(userLocation.accuracy)}m)
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>{t.emergency.locationStatusUnavailable}</span>
                  </span>
                  <button
                    onClick={onRequestLocation}
                    disabled={geolocationStatus === 'requesting'}
                    className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    {geolocationStatus === 'requesting' ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" />
                        <span>{t.emergency.detectGpsButton}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Manual Landmark Selector Fallback if GPS is inactive or user wants to specify */}
            <div className="mt-2 pt-2 border-t border-slate-700/80">
              <label
                htmlFor="sos-landmark-selector"
                className="block text-[11px] text-slate-300 font-medium mb-1.5"
              >
                {locationSource === 'live_gps'
                  ? 'Override GPS with Landmark (Optional):'
                  : t.emergency.selectManualLandmark}
              </label>
              <select
                id="sos-landmark-selector"
                value={selectedLandmarkId}
                onChange={(e) => setSelectedLandmarkId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                {KNOWN_RIVERFRONT_LANDMARKS.map((landmark) => (
                  <option key={landmark.id} value={landmark.id}>
                    {landmark.name[currentLanguage] || landmark.name.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 3: NEAREST ON-GROUND AID STATIONS RESOLVER */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>{t.emergency.nearestAidTitle}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CARD A: NEAREST FIRST AID CLINIC */}
              <div className="bg-slate-800/95 border-2 border-red-500/60 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 flex items-center space-x-1">
                      <Cross className="w-3 h-3 text-red-400" />
                      <span>{t.emergency.nearestMedicalTitle}</span>
                    </span>
                    {nearestMedical && (
                      <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
                        {nearestMedical.distanceMeters}m {t.emergency.distanceAway}
                      </span>
                    )}
                  </div>

                  {nearestMedical ? (
                    <>
                      <h4 className="font-extrabold text-sm sm:text-base text-white leading-tight mb-1">
                        {nearestMedical.facility.name[currentLanguage] ||
                          nearestMedical.facility.name.en}
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                        {nearestMedical.facility.description[currentLanguage] ||
                          nearestMedical.facility.description.en}
                      </p>
                      <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-semibold mb-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          ~{nearestMedical.estimatedWalkMinutes} min {t.emergency.estimatedWalkTime}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 py-3">
                      Scanning for nearest medical post...
                    </p>
                  )}
                </div>

                {nearestMedical && (
                  <button
                    onClick={() => handleStartWalkRoute(nearestMedical.facility)}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 shadow transition-all cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{t.emergency.walkDirectionsButton}</span>
                  </button>
                )}
              </div>

              {/* CARD B: NEAREST POLICE HELPDESK */}
              <div className="bg-slate-800/95 border-2 border-blue-500/60 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span>{t.emergency.nearestPoliceTitle}</span>
                    </span>
                    {nearestPolice && (
                      <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
                        {nearestPolice.distanceMeters}m {t.emergency.distanceAway}
                      </span>
                    )}
                  </div>

                  {nearestPolice ? (
                    <>
                      <h4 className="font-extrabold text-sm sm:text-base text-white leading-tight mb-1">
                        {nearestPolice.facility.name[currentLanguage] ||
                          nearestPolice.facility.name.en}
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                        {nearestPolice.facility.description[currentLanguage] ||
                          nearestPolice.facility.description.en}
                      </p>
                      <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-semibold mb-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          ~{nearestPolice.estimatedWalkMinutes} min {t.emergency.estimatedWalkTime}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 py-3">
                      Scanning for nearest police booth...
                    </p>
                  )}
                </div>

                {nearestPolice && (
                  <button
                    onClick={() => handleStartWalkRoute(nearestPolice.facility)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 shadow transition-all cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{t.emergency.walkDirectionsButton}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Walking Time Disclaimer (Mandatory Safety Distinction) */}
            <p className="text-[10px] text-slate-400 italic mt-2 text-center">
              * {t.emergency.walkDisclaimer}
            </p>
          </div>

          {/* SECTION 4: DIGITAL INCIDENT REPORT BUTTON */}
          <div className="pt-2">
            <button
              onClick={handleOpenDigitalReport}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>{t.emergency.reportToControlRoomButton}</span>
            </button>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>AP Disaster Management & Pushkaralu Security 2027</span>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 font-bold px-3 py-1 rounded bg-slate-800 hover:bg-slate-750 cursor-pointer"
          >
            {t.emergency.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
};
