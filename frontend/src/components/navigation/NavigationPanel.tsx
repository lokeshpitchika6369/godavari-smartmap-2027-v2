import React, { useState, useMemo } from 'react';
import { Language, NavigationRoute, UserLocation } from '../../types';
import { translations } from '../../i18n/translations';
import {
  getNavigationProgress,
  DOCUMENTED_WALKING_SPEED_MPS,
} from '../../services/routingService';
import {
  X,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  Maximize2,
  Crosshair,
  AlertTriangle,
  RefreshCw,
  List,
} from 'lucide-react';

interface NavigationPanelProps {
  currentLanguage: Language;
  route: NavigationRoute;
  userLocation: UserLocation | null;
  onExitNavigation: () => void;
  onChangeOrigin: () => void;
  isOutsideGeofence?: boolean;
  offsiteDistanceKm?: number | null;
  onRouteOverview?: () => void;
  onRecenterOnUser?: () => void;
  isFollowingUser?: boolean;
  isOffRoute?: boolean;
  offRouteDistanceMeters?: number;
  onRecalculateRoute?: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  currentLanguage,
  route,
  userLocation,
  onExitNavigation,
  onChangeOrigin,
  isOutsideGeofence,
  offsiteDistanceKm,
  onRouteOverview,
  onRecenterOnUser,
  isFollowingUser = true,
  isOffRoute = false,
  offRouteDistanceMeters = 0,
  onRecalculateRoute,
}) => {
  const t = translations[currentLanguage];
  const [isStepsExpanded, setIsStepsExpanded] = useState<boolean>(false);

  // Compute real-time navigation progress along active route
  const progress = useMemo(() => {
    if (!userLocation) return null;
    return getNavigationProgress(userLocation, route, DOCUMENTED_WALKING_SPEED_MPS);
  }, [userLocation, route]);

  const effectiveRemainingDist = progress
    ? progress.remainingDistanceMeters
    : route.totalDistanceMeters;

  const effectiveRemainingMins = progress
    ? progress.remainingMinutes
    : route.estimatedWalkingMinutes;

  const effectiveEta = progress
    ? progress.formattedEta
    : new Date(Date.now() + route.estimatedWalkingMinutes * 60000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

  const effectiveIsArrived = progress ? progress.isArrived : route.isArrived;
  const effectiveIsOffRoute = isOffRoute || (progress ? progress.isOffRoute : false);
  const effectiveOffDistance = offRouteDistanceMeters || (progress ? progress.distanceToRouteMeters : 0);

  const activeStep = progress?.currentStep || route.steps[0] || null;
  const nextStep = progress?.nextStep || (route.steps.length > 1 ? route.steps[1] : null);
  const distanceToTurn = progress ? progress.distanceToNextTurnMeters : activeStep?.distanceMeters || 0;

  const exitNavLabel = {
    en: 'Exit Navigation',
    te: 'నిష్క్రమించు',
    hi: 'समाप्त करें',
  }[currentLanguage] || 'Exit Navigation';

  const getManeuverIcon = (turnType?: string, className: string = 'w-6 h-6') => {
    switch (turnType) {
      case 'left':
        return <CornerUpLeft className={className} />;
      case 'right':
        return <CornerUpRight className={className} />;
      case 'slight_left':
        return <ArrowUpLeft className={className} />;
      case 'slight_right':
        return <ArrowUpRight className={className} />;
      case 'arrive':
        return <CheckCircle2 className={className} />;
      default:
        return <ArrowUp className={className} />;
    }
  };

  return (
    <>
      {/* Mobile Top Alerts (off-site / off-route / arrival) */}
      <div className="md:hidden fixed top-14 inset-x-3 z-30 pointer-events-none flex flex-col gap-1.5 font-sans">
        {/* 1. Off-site Event Perimeter Notice Banner */}
        {isOutsideGeofence && (
          <div className="pointer-events-auto bg-amber-500 text-slate-950 p-2.5 rounded-xl shadow-lg border border-amber-300 flex items-center justify-between gap-2 text-xs">
            <span className="font-extrabold truncate">
              {t.navigation.outsideGeofenceNotice} {offsiteDistanceKm ? `(~${offsiteDistanceKm} km)` : ''}
            </span>
            <button
              onClick={onChangeOrigin}
              className="px-2 py-0.5 bg-slate-950 text-amber-300 font-bold rounded text-[10px] shrink-0"
            >
              {t.navigation.changeGateBtn}
            </button>
          </div>
        )}

        {/* 2. Destination Arrival Banner */}
        {effectiveIsArrived && (
          <div className="pointer-events-auto bg-emerald-600 text-white p-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-bounce border border-emerald-400">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <div className="font-black text-xs">{t.navigation.arrivedTitle} - {t.navigation.arrivedDesc}</div>
          </div>
        )}

        {/* 3. Off-Route Recalculation Alert */}
        {effectiveIsOffRoute && !effectiveIsArrived && (
          <div className="pointer-events-auto bg-rose-600 text-white p-2.5 rounded-xl shadow-lg flex items-center justify-between gap-2 border border-rose-400 text-xs">
            <span className="font-bold truncate">Off route (~{effectiveOffDistance}m)</span>
            {onRecalculateRoute && (
              <button
                onClick={onRecalculateRoute}
                className="px-2 py-0.5 bg-white text-rose-700 font-bold rounded text-[10px] shrink-0"
              >
                Reroute
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. MOBILE FIXED COMPACT BOTTOM NAVIGATION HUD (< md) - REPLACES BOTTOM TABS */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[110px] bg-slate-950 border-t-2 border-emerald-500 p-3 flex flex-col justify-between shadow-2xl text-white select-none">
        {/* Row 1: Next Direction & Maneuver Instruction */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md border border-emerald-400/40 text-lg font-black">
            {getManeuverIcon(activeStep?.turnType, 'w-5 h-5 stroke-[2.5]')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-emerald-400">
                IN {distanceToTurn}m
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                ➔ {route.destination.name[currentLanguage] || route.destination.name.en}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate leading-snug">
              {activeStep
                ? activeStep.instruction[currentLanguage] || activeStep.instruction.en
                : `Walk toward ${route.destination.name[currentLanguage] || route.destination.name.en}`}
            </p>
          </div>
        </div>

        {/* Row 2: Metrics Row & Exit Navigation Action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <div>
              <span className="text-sm font-black text-white">{effectiveRemainingDist}m</span>
              <span className="text-[10px] text-slate-400 ml-1 font-sans">left</span>
            </div>
            <span className="text-slate-600">•</span>
            <div>
              <span className="text-sm font-black text-emerald-400">{effectiveRemainingMins}m</span>
              <span className="text-[10px] text-slate-400 ml-1 font-sans">walk</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800/60 font-sans">
              {effectiveEta} ETA
            </span>
          </div>

          {/* Exit Navigation Button */}
          <button
            onClick={onExitNavigation}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs shadow-md border border-red-500 flex items-center space-x-1 transition-all"
            aria-label={exitNavLabel}
          >
            <span>🛑</span>
            <span>{exitNavLabel}</span>
          </button>
        </div>
      </div>

      {/* 5. DESKTOP NAVIGATION PANEL (>= md) - 100% PRESERVED */}
      <div className="hidden md:flex absolute inset-x-3 top-3 pointer-events-none z-30 flex-col gap-2 font-sans max-w-xl mx-auto md:mx-0 md:left-4 md:right-auto md:w-[420px]">
      {/* 1. Off-site Event Perimeter Notice Banner */}
      {isOutsideGeofence && (
        <div className="pointer-events-auto bg-amber-500 text-slate-950 p-3 rounded-2xl shadow-xl border-2 border-amber-300 flex items-start justify-between gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-950/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="font-extrabold text-xs uppercase tracking-wide leading-tight">
                {t.navigation.outsideGeofenceNotice} {offsiteDistanceKm ? `(~${offsiteDistanceKm} km)` : ''}
              </div>
              <div className="text-[11px] font-semibold text-slate-900 mt-0.5">
                {t.navigation.outsideGeofenceDesc}
              </div>
            </div>
          </div>
          <button
            onClick={onChangeOrigin}
            className="px-2.5 py-1 bg-slate-950 text-amber-300 hover:bg-slate-900 font-bold rounded-lg text-xs whitespace-nowrap transition-colors shadow-sm"
          >
            {t.navigation.changeGateBtn}
          </button>
        </div>
      )}

      {/* 2. Destination Arrival Banner */}
      {effectiveIsArrived && (
        <div className="pointer-events-auto bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-emerald-400">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-black text-base leading-tight">
              {t.navigation.arrivedTitle}
            </div>
            <div className="text-xs text-emerald-100 mt-0.5">
              {t.navigation.arrivedDesc}
            </div>
          </div>
        </div>
      )}

      {/* 3. Off-Route Recalculation Alert */}
      {effectiveIsOffRoute && !effectiveIsArrived && (
        <div className="pointer-events-auto bg-rose-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-pulse border-2 border-rose-400">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <div>
              <div className="font-black text-xs uppercase tracking-wide">
                {t.navigation.offRouteNotice}
              </div>
              <div className="text-[11px] text-rose-100">
                Deviated by ~{effectiveOffDistance}m from pedestrian route
              </div>
            </div>
          </div>
          {onRecalculateRoute && (
            <button
              onClick={onRecalculateRoute}
              className="px-2.5 py-1 bg-white text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Reroute</span>
            </button>
          )}
        </div>
      )}

      {/* 5. DESKTOP TOP MANEUVER HUD CARD (hidden on mobile, visible on desktop) */}
      <div className="hidden md:block pointer-events-auto bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden text-white">
        <div className="p-3.5 flex items-start gap-3.5">
          {/* Large Directional Maneuver Icon */}
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg border border-emerald-400/40">
            {getManeuverIcon(activeStep?.turnType, 'w-7 h-7 stroke-[2.5]')}
          </div>

          <div className="flex-1 min-w-0">
            {/* Distance to Turn */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                {distanceToTurn}
              </span>
              <span className="text-xs uppercase font-extrabold text-emerald-300">
                {t.gps.meters}
              </span>
            </div>

            {/* Maneuver Instruction */}
            <div className="text-sm font-bold text-white/95 leading-snug line-clamp-2 mt-0.5">
              {activeStep
                ? activeStep.instruction[currentLanguage] || activeStep.instruction.en
                : `Walk toward ${route.destination.name[currentLanguage] || route.destination.name.en}`}
            </div>

            {/* Next Sub-Maneuver Hint */}
            {nextStep && (
              <div className="text-[11px] text-slate-400 font-medium truncate mt-1 flex items-center gap-1">
                <span className="text-slate-500 uppercase text-[9px] font-bold">Then:</span>
                <span>{nextStep.instruction[currentLanguage] || nextStep.instruction.en}</span>
              </div>
            )}
          </div>

          {/* Quick Exit Button */}
          <button
            onClick={onExitNavigation}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title={t.navigation.stopNavigation}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Route Safety / Detour Sub-bar */}
        {route.congestionAvoided && (
          <div className="px-3.5 py-1.5 bg-emerald-950/80 border-t border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-300">
            <span className="font-semibold flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Smart Detour Active (Crowd Avoidance)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Direct {route.originalDistanceMeters}m → Walk {route.totalDistanceMeters}m
            </span>
          </div>
        )}
      </div>

      {/* 6. DESKTOP BOTTOM / SECONDARY NAVIGATION CONTROLS (hidden on mobile, visible on desktop) */}
      <div className="hidden md:block pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden text-slate-800">
        <div className="p-3.5 flex items-center justify-between gap-3">
          {/* Estimated Time Remaining & ETA */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {effectiveRemainingMins}
              </span>
              <span className="text-xs uppercase font-extrabold text-emerald-700">
                {t.navigation.minutes}
              </span>
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>{effectiveRemainingDist} {t.gps.meters}</span>
              <span>•</span>
              <span>{t.navigation.eta} {effectiveEta}</span>
            </div>
          </div>

          {/* Location Source / Accuracy Badge */}
          <div className="text-right flex flex-col items-end">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                userLocation?.source === 'live_gps'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${userLocation?.source === 'live_gps' ? 'bg-blue-600 animate-ping' : 'bg-amber-600'}`}></span>
              <span>
                {userLocation?.source === 'live_gps'
                  ? `Live GPS (±${Math.round(userLocation.accuracy || 8)}m)`
                  : userLocation?.label || 'Manual Gate'}
              </span>
            </span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">
              {t.navigation.walkingSpeedNote}
            </span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200/70 flex items-center justify-between gap-1.5">
          {/* Route Overview */}
          {onRouteOverview && (
            <button
              onClick={onRouteOverview}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              title="Overview entire route"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.navigation.routeOverview}</span>
            </button>
          )}

          {/* Re-center / Follow Mode */}
          {onRecenterOnUser && (
            <button
              onClick={onRecenterOnUser}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isFollowingUser
                  ? 'bg-blue-600 text-white shadow-blue-200'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title="Follow user location"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isFollowingUser ? 'text-white' : 'text-blue-600'}`} />
              <span>{t.navigation.recenter}</span>
            </button>
          )}

          {/* Turn-by-Turn Expand Toggle */}
          <button
            onClick={() => setIsStepsExpanded(!isStepsExpanded)}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <List className="w-3.5 h-3.5 text-indigo-600" />
            <span>Steps ({route.steps.length})</span>
            {isStepsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Change Starting Point */}
          <button
            onClick={onChangeOrigin}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Change Starting Point"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
          </button>
        </div>

        {/* Turn-by-Turn Guidance Expandable Drawer */}
        {isStepsExpanded && (
          <div className="p-3 bg-slate-50/90 border-t border-slate-200 space-y-2 max-h-56 overflow-y-auto">
            {route.steps.map((step, idx) => {
              const isCurrent = progress?.currentStepIndex === idx;
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                    isCurrent
                      ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                      : 'bg-white border border-slate-200/70 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {getManeuverIcon(step.turnType, 'w-3.5 h-3.5')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="leading-snug">
                      {step.instruction[currentLanguage] || step.instruction.en}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      Step {idx + 1} • {step.distanceMeters} {t.gps.meters}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
