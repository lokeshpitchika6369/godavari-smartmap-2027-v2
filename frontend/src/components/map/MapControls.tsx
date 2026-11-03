import React from 'react';
import {
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  Navigation,
  Scan,
  Loader2,
  Users,
  Maximize2,
  Crosshair,
} from 'lucide-react';
import { translations } from '../../i18n/translations';
import { Language, GeolocationStatus, UserLocation } from '../../types';

interface MapControlsProps {
  currentLanguage: Language;
  viewMode: '3D' | '2D';
  onToggleViewMode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onRotate: () => void;
  geolocationStatus: GeolocationStatus;
  onRequestLocation: () => void;
  onOpenQrScanner: () => void;
  onOpenCrowdReport?: () => void;
  userLocation: UserLocation | null;
  isRouteActive?: boolean;
  onRouteOverview?: () => void;
  onReturnToLocation?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  currentLanguage,
  viewMode,
  onToggleViewMode,
  onZoomIn,
  onZoomOut,
  onResetView,
  onRotate,
  geolocationStatus,
  onRequestLocation,
  onOpenQrScanner,
  onOpenCrowdReport,
  userLocation,
  isRouteActive = false,
  onRouteOverview,
  onReturnToLocation,
}) => {
  const t = translations[currentLanguage];

  const getGpsButtonClasses = () => {
    if (geolocationStatus === 'active') {
      return 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900';
    }
    if (geolocationStatus === 'requesting') {
      return 'bg-blue-900/60 text-blue-300 animate-pulse';
    }
    if (geolocationStatus === 'denied' || geolocationStatus === 'unavailable') {
      return 'text-amber-400 hover:text-amber-300 hover:bg-slate-800';
    }
    return 'text-slate-300 hover:text-white hover:bg-slate-800';
  };

  const getGpsTitle = () => {
    if (geolocationStatus === 'active' && userLocation) {
      return `${t.gps.liveLocation} (±${Math.round(userLocation.accuracy || 0)}m)`;
    }
    if (geolocationStatus === 'requesting') {
      return t.gps.locating;
    }
    if (geolocationStatus === 'denied') {
      return t.gps.permissionDenied;
    }
    return t.gps.locateMe;
  };

  const mobileLabels = {
    en: { myLocation: 'Location', layers: 'Layers', compass: 'Compass' },
    te: { myLocation: 'లొకేషన్', layers: 'లేయర్స్', compass: 'దిక్సూచి' },
    hi: { myLocation: 'लोकेशन', layers: 'परतें', compass: 'दिशा' },
  }[currentLanguage] || { myLocation: 'Location', layers: 'Layers', compass: 'Compass' };

  return (
    <>
      {/* Streamlined 3-Button Mobile Right Toolbar (< md) */}
      <div className="flex md:hidden absolute right-3 top-4 z-20 flex-col space-y-2.5">
        {/* 1. My Location Control */}
        <button
          onClick={userLocation && onReturnToLocation ? onReturnToLocation : onRequestLocation}
          className={`w-11 h-11 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all ${
            geolocationStatus === 'active'
              ? 'text-blue-400 ring-2 ring-blue-500/40 border-blue-500/60'
              : 'text-slate-300 hover:text-white'
          }`}
          title={mobileLabels.myLocation}
          aria-label={mobileLabels.myLocation}
        >
          <Crosshair className={`w-4 h-4 ${geolocationStatus === 'active' ? 'text-blue-400' : ''}`} />
          <span className="text-[7.5px] font-black uppercase tracking-tight text-slate-300 mt-0.5">
            {mobileLabels.myLocation}
          </span>
        </button>

        {/* 2. Map Layers Control */}
        <button
          onClick={onToggleViewMode}
          className={`w-11 h-11 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all ${
            viewMode === '3D' ? 'text-amber-400 ring-2 ring-amber-500/30' : 'text-slate-300 hover:text-white'
          }`}
          title={viewMode === '3D' ? t.map.mode3D : t.map.mode2D}
          aria-label="Toggle Map Layers"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[7.5px] font-black uppercase tracking-tight text-slate-300 mt-0.5">
            {mobileLabels.layers}
          </span>
        </button>

        {/* 3. Compass Control */}
        <button
          onClick={onResetView}
          className="w-11 h-11 rounded-2xl bg-slate-900/95 text-rose-400 hover:text-rose-300 border border-slate-700 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all"
          title={mobileLabels.compass}
          aria-label={mobileLabels.compass}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[7.5px] font-black uppercase tracking-tight text-slate-300 mt-0.5">
            {mobileLabels.compass}
          </span>
        </button>
      </div>

      {/* Full Desktop Toolbar (>= md) - 100% Preserved */}
      <div className="hidden md:flex absolute right-4 top-20 z-20 flex-col space-y-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-2xl">
      {/* Real Device GPS Locate Button */}
      <button
        onClick={onRequestLocation}
        className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${getGpsButtonClasses()}`}
        title={getGpsTitle()}
        aria-label="Locate Me via GPS"
      >
        {geolocationStatus === 'requesting' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Navigation className={`w-5 h-5 ${geolocationStatus === 'active' ? 'fill-current' : ''}`} />
        )}
      </button>

      {/* QR Code Scanner Button */}
      <button
        onClick={onOpenQrScanner}
        className="p-2.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors flex items-center justify-center"
        title={t.qr.scanQrBtn}
        aria-label="Scan QR Code"
      >
        <Scan className="w-5 h-5" />
      </button>

      {/* Live Crowd Density Report Button */}
      {onOpenCrowdReport && (
        <button
          onClick={onOpenCrowdReport}
          className="p-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors flex items-center justify-center"
          title="Report Live Crowd Density"
          aria-label="Report Live Crowd Density"
        >
          <Users className="w-5 h-5" />
        </button>
      )}

      <div className="w-full h-px bg-slate-800 my-0.5"></div>

      {/* 2D / 3D Mode Toggle */}
      <button
        onClick={onToggleViewMode}
        className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
          viewMode === '3D'
            ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
        title={viewMode === '3D' ? t.map.mode3D : t.map.mode2D}
        aria-label="Toggle 3D View Mode"
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* Compass / Rotate */}
      <button
        onClick={onRotate}
        className="p-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors flex items-center justify-center"
        title="Rotate 3D Camera 45°"
        aria-label="Rotate Camera"
      >
        <Compass className="w-5 h-5" />
      </button>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
        title={t.map.zoomIn}
        aria-label="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
        title={t.map.zoomOut}
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      {/* Reset View */}
      <button
        onClick={onResetView}
        className="p-2.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors flex items-center justify-center"
        title={t.map.resetView}
        aria-label="Reset View"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Route Overview Button (When active route exists) */}
      {isRouteActive && onRouteOverview && (
        <button
          onClick={onRouteOverview}
          className="p-2.5 rounded-lg bg-blue-600/90 text-white hover:bg-blue-500 shadow-md transition-all flex items-center justify-center animate-pulse"
          title="Overview Full Route"
          aria-label="Route Overview"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      )}

      {/* Return to My Location (When user location is available) */}
      {userLocation && onReturnToLocation && (
        <button
          onClick={onReturnToLocation}
          className="p-2.5 rounded-lg text-slate-300 hover:text-blue-400 hover:bg-slate-800 transition-colors flex items-center justify-center"
          title="Center on My Location"
          aria-label="Center on My Location"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      )}
    </div>
    </>
  );
};
