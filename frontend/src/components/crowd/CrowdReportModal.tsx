import React, { useState } from 'react';
import { Language, CrowdCongestionLevel, UserLocation } from '../../types';
import { submitCrowdReport } from '../../services/apiService';
import { Users, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CrowdReportModalProps {
  currentLanguage: Language;
  userLocation: UserLocation | null;
  onClose: () => void;
}

const PRESET_LOCATIONS = [
  { name: 'Pushkar Main Bathing Ghat', lat: 17.0018, lng: 81.7812 },
  { name: 'Kotilingala Ghat North Steps', lat: 17.0035, lng: 81.7801 },
  { name: 'Saraswathi Ghat Promenade', lat: 17.0008, lng: 81.7824 },
  { name: 'Central Main Gate 02', lat: 17.0018, lng: 81.7812 },
  { name: 'North Pushkar Gate 01', lat: 17.0042, lng: 81.7798 },
  { name: 'South Promenade Entry Gate 03', lat: 16.9995, lng: 81.7830 },
  { name: 'VIP & Elderly Ramp Approach', lat: 17.0022, lng: 81.7809 },
];

export const CrowdReportModal: React.FC<CrowdReportModalProps> = ({
  userLocation,
  onClose,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>(PRESET_LOCATIONS[0].name);
  const [congestionLevel, setCongestionLevel] = useState<CrowdCongestionLevel>('moderate');
  const [waitMinutes, setWaitMinutes] = useState<number>(15);
  const [comments, setComments] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const locObj = PRESET_LOCATIONS.find((l) => l.name === selectedLocation) || PRESET_LOCATIONS[0];
    const lat = userLocation?.lat || locObj.lat;
    const lng = userLocation?.lng || locObj.lng;

    try {
      setIsSubmitting(true);
      const res = await submitCrowdReport({
        location_name: selectedLocation,
        latitude: lat,
        longitude: lng,
        congestion_level: congestionLevel,
        reported_wait_minutes: waitMinutes,
        comments: comments.trim() || undefined,
      });
      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit crowd report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide">Report Live Crowd Density</h3>
              <p className="text-[11px] text-emerald-200">Help fellow pilgrims navigate safely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success Confirmation */}
        {successMessage ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-black text-slate-900">Thank You!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">{successMessage}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {errorMessage && (
              <div className="bg-red-50 border border-red-300 p-3 rounded-lg flex items-start space-x-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Ghat or Gateway Location *
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Observed Congestion Level *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { level: 'low', label: 'Low', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                  { level: 'moderate', label: 'Moderate', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                  { level: 'high', label: 'High', color: 'border-orange-500 bg-orange-50 text-orange-900' },
                  { level: 'severe', label: 'Severe', color: 'border-red-600 bg-red-50 text-red-900' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setCongestionLevel(item.level as CrowdCongestionLevel)}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      congestionLevel === item.level
                        ? `${item.color} ring-2 ring-emerald-500 shadow-sm font-black`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Estimated Queue Wait Time: <span className="text-emerald-700 font-black">{waitMinutes} mins</span>
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={waitMinutes}
                onChange={(e) => setWaitMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Quick Observation Notes (Optional)
              </label>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Slow movement near water booth, barricade open"
                maxLength={200}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Density Report</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
