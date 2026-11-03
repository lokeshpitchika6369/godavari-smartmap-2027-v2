import React, { useState } from 'react';
import { Language, CrowdZoneDensity } from '../../types';
import {
  CrowdSimulationPreset,
  CROWD_PRESET_METADATA,
  CROWD_FACTOR_MAP,
  CROWD_DISCLAIMER_I18N,
  getCrowdDensityZones,
} from '../../services/crowdDensityService';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Navigation,
  ShieldAlert,
  Info,
  Clock,
} from 'lucide-react';

interface CrowdHeatmapLegendProps {
  currentLanguage: Language;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  avoidCrowds: boolean;
  onToggleAvoidCrowds: () => void;
  currentPreset: CrowdSimulationPreset;
  onPresetChange: (preset: CrowdSimulationPreset) => void;
  activeRouteDetoured?: boolean;
}

export const CrowdHeatmapLegend: React.FC<CrowdHeatmapLegendProps> = ({
  currentLanguage,
  showOverlay,
  onToggleOverlay,
  avoidCrowds,
  onToggleAvoidCrowds,
  currentPreset,
  onPresetChange,
  activeRouteDetoured = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const zones = getCrowdDensityZones(currentPreset);
  const criticalZones = zones.filter((z) => z.densityLevel === 'critical' || z.densityLevel === 'high');

  const titles: Record<Language, { title: string; subtitle: string; simBadge: string }> = {
    en: {
      title: 'Crowd Density Heatmap',
      subtitle: 'Dynamic Congestion & Smart Detour',
      simBadge: 'SIMULATED DATA',
    },
    te: {
      title: 'రద్దీ సాంద్రత హీట్‌మ్యాప్',
      subtitle: 'డైనమిక్ రద్దీ & స్మార్ట్ ప్రత్యామ్నాయ మార్గాలు',
      simBadge: 'అనుకరణ డేటా',
    },
    hi: {
      title: 'भीड़ घनत्व हीटमैप',
      subtitle: 'गतिशील संकुलन एवं स्मार्ट वैकल्पिक मार्ग',
      simBadge: 'सिम्युलेटेड डेटा',
    },
  };

  const currentMeta = CROWD_PRESET_METADATA[currentPreset];
  const tInfo = titles[currentLanguage];
  const disclaimerText = CROWD_DISCLAIMER_I18N[currentLanguage];

  return (
    <>
      {/* 1. Mobile Compact Map-Layer Pill Button (< md) */}
      <div className="md:hidden absolute bottom-20 left-4 z-20 pointer-events-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white rounded-full border border-amber-500/80 shadow-xl text-xs font-bold active:scale-95 transition-all"
          aria-label="Toggle Crowd Density Controls"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{showOverlay ? 'Heatmap: ON' : 'Heatmap: OFF'}</span>
          <span className={`w-2 h-2 rounded-full ${showOverlay ? 'bg-emerald-400' : 'bg-slate-500'}`} />
        </button>
      </div>

      {/* 2. Mobile Slide-Over Bottom Sheet for Heatmap Controls (< md) */}
      {isExpanded && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          />
          <div className="relative bg-slate-900 border-t-2 border-amber-500 rounded-t-2xl shadow-2xl p-4 space-y-3 z-10 max-h-[75vh] overflow-y-auto mb-14">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {tInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Close heatmap controls"
              >
                ✕
              </button>
            </div>

            {/* Quick Toggle Buttons: Heatmap ON/OFF & Avoid Crowds */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onToggleOverlay}
                className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  showOverlay
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {showOverlay ? <Eye className="w-4 h-4 text-emerald-200" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                <span>{showOverlay ? 'Heatmap: ON' : 'Heatmap: OFF'}</span>
              </button>

              <button
                onClick={onToggleAvoidCrowds}
                className={`flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  avoidCrowds
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Navigation className="w-4 h-4 text-amber-200" />
                <span>{avoidCrowds ? 'Avoid Crowds' : 'Shortest Path'}</span>
              </button>
            </div>

            {/* Simulation Preset Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {currentLanguage === 'te'
                  ? 'సిమ్యులేషన్ దృష్టాంతం'
                  : currentLanguage === 'hi'
                  ? 'सिम्युलेशन परिदृश्य'
                  : 'Simulation Scenario'}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    'peak_snanam_rush',
                    'evening_aarti_rush',
                    'normal_flow',
                    'all_clear',
                  ] as CrowdSimulationPreset[]
                ).map((preset) => {
                  const isSel = currentPreset === preset;
                  const meta = CROWD_PRESET_METADATA[preset];
                  return (
                    <button
                      key={preset}
                      onClick={() => onPresetChange(preset)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        isSel
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-[11px] truncate">
                        {meta.name[currentLanguage] || meta.name.en}
                      </div>
                      <div className="text-[9px] text-slate-400 line-clamp-1">
                        {meta.description[currentLanguage] || meta.description.en}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Desktop Legend Card (hidden on mobile, visible on desktop) */}
      <div className="hidden md:block absolute top-20 right-4 z-20 max-w-sm w-full sm:w-84 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl text-white overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div
        className="flex items-center justify-between p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Flame className="w-5 h-5 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-100">{tInfo.title}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold tracking-wide">
                {tInfo.simBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">{tInfo.subtitle}</p>
          </div>
        </div>

        <button
          className="text-slate-400 hover:text-white p-1 rounded-md"
          aria-label={isExpanded ? 'Collapse Legend' : 'Expand Legend'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Main Controls: Show Heatmap & Avoid Crowds */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleOverlay}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                showOverlay
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              {showOverlay ? <Eye className="w-4 h-4 text-emerald-200" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              <span>
                {currentLanguage === 'te'
                  ? showOverlay ? 'హీట్‌మ్యాప్ ఆన్' : 'హీట్‌మ్యాప్ దాచు'
                  : currentLanguage === 'hi'
                  ? showOverlay ? 'हीटमैप ऑन' : 'हीटमैप छिपाएं'
                  : showOverlay ? 'Heatmap ON' : 'Heatmap OFF'}
              </span>
            </button>

            <button
              onClick={onToggleAvoidCrowds}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                avoidCrowds
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Navigation className="w-4 h-4 text-amber-200" />
              <span>
                {currentLanguage === 'te'
                  ? avoidCrowds ? 'రద్దీ బైపాస్ ఆన్' : 'రద్దీ బైపాస్ ఆఫ్'
                  : currentLanguage === 'hi'
                  ? avoidCrowds ? 'स्मार्ट बाईपास ऑन' : 'स्मार्ट बाईपास ऑफ'
                  : avoidCrowds ? 'Avoid Crowds' : 'Shortest Path'}
              </span>
            </button>
          </div>

          {/* Active Detour Alert Banner */}
          {activeRouteDetoured && avoidCrowds && (
            <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-emerald-200 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[11px] text-emerald-300">
                  {currentLanguage === 'te'
                    ? 'స్మార్ట్ బైపాస్ సక్రియం: ఎగువ బండ్ మార్గం ద్వారా దారిమళ్లింపు'
                    : currentLanguage === 'hi'
                    ? 'स्मार्ट बाईपास सक्रिय: ऊपरी तटबंध मार्ग से सुरक्षित डायवर्जन'
                    : 'Smart Detour Active: Diverted via Upper Bund Elevated Walkway'}
                </p>
                <p className="text-[10px] text-emerald-300/80 mt-0.5">
                  {currentLanguage === 'te'
                    ? 'పుష్కర్ ఘాట్ వద్ద తీవ్ర రద్దీ మరియు తొక్కిసలాట ముప్పు నివారించబడింది.'
                    : currentLanguage === 'hi'
                    ? 'पुष्कर घाट पर अत्यधिक भीड़ एवं अवरोध को सफलतापूर्वक टाला गया।'
                    : 'Heavy pedestrian congestion at Pushkar Ghat corridor bypassed safely.'}
                </p>
              </div>
            </div>
          )}

          {/* Simulation Preset Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
                {currentLanguage === 'te'
                  ? 'సిమ్యులేషన్ దృష్టాంతం'
                  : currentLanguage === 'hi'
                  ? 'सिम्युलेशन परिदृश्य'
                  : 'Simulation Scenario'}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Simulated</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  'peak_snanam_rush',
                  'evening_aarti_rush',
                  'normal_flow',
                  'all_clear',
                ] as CrowdSimulationPreset[]
              ).map((presetKey) => {
                const meta = CROWD_PRESET_METADATA[presetKey];
                const isSelected = currentPreset === presetKey;
                return (
                  <button
                    key={presetKey}
                    onClick={() => onPresetChange(presetKey)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-[11px] truncate">
                      {meta.name[currentLanguage]}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">
              {currentMeta.description[currentLanguage]}
            </p>
          </div>

          {/* Crowd Density Scale Legend (4 Tiers) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">
              {currentLanguage === 'te'
                ? 'రద్దీ సాంద్రత సూచిక'
                : currentLanguage === 'hi'
                ? 'भीड़ घनत्व सूचकांक'
                : 'Density Multiplier Legend'}
            </span>

            <div className="space-y-1.5">
              {(['low', 'medium', 'high', 'critical'] as CrowdZoneDensity[]).map((level) => {
                const meta = CROWD_FACTOR_MAP[level];
                const labels: Record<CrowdZoneDensity, Record<Language, string>> = {
                  low: { en: 'Low (Smooth Flow)', te: 'తక్కువ (సాఫీ ప్రవాహం)', hi: 'कम (सुगम)' },
                  medium: { en: 'Medium (Moderate Pace)', te: 'మధ్యస్థ (మోస్తరు వేగం)', hi: 'मध्यम (सामान्य)' },
                  high: { en: 'High (Heavy Queues)', te: 'అధిక (నెమ్మది వరుసలు)', hi: 'उच्च (भारी कतारें)' },
                  critical: { en: 'Critical (Bottleneck)', te: 'తీవ్ర (ప్రతిష్టంభన)', hi: 'गंभीर (अवरोध)' },
                };

                return (
                  <div
                    key={level}
                    className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-800/50 border border-slate-700/40"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: meta.colorHex }}
                      />
                      <span className="text-[11px] font-medium text-slate-200">
                        {labels[level][currentLanguage]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                        {meta.multiplierText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Congestion Hotspots Summary */}
          {criticalZones.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="font-semibold text-[10px] uppercase tracking-wider text-red-400">
                {currentLanguage === 'te'
                  ? 'ప్రస్తుత అధిక రద్దీ ప్రాంతాలు'
                  : currentLanguage === 'hi'
                  ? 'सक्रिय अत्यधिक भीड़ वाले क्षेत्र'
                  : 'Active Congestion Hotspots'}
              </span>
              <div className="space-y-1">
                {criticalZones.map((z) => (
                  <div
                    key={z.id}
                    className="flex items-center justify-between text-[11px] px-2 py-1 bg-red-950/30 border border-red-900/40 rounded-lg text-red-200"
                  >
                    <span className="truncate pr-2">{z.name[currentLanguage]}</span>
                    <span className="font-mono text-[10px] shrink-0 text-red-300 font-bold">
                      ~{z.estimatedWaitMinutes}m wait
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Safety & Planning Disclaimer */}
          <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-start space-x-2 text-[10px] text-slate-400 leading-tight">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p>{disclaimerText}</p>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
