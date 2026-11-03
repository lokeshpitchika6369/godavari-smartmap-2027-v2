import React, { useState, useEffect } from 'react';
import { Language, EmergencyType, EmergencySeverity, EmergencyReportReceipt } from '../../types';
import { translations } from '../../i18n/translations';
import { submitEmergencyReport } from '../../services/apiService';
import { dispatchEmergencyAlertEvent } from '../../services/emergencyProximity';
import {
  ArrowLeft,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Phone,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface EmergencyViewProps {
  currentLanguage: Language;
  onBackToMap: () => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  currentLanguage,
  onBackToMap,
}) => {
  const t = translations[currentLanguage];

  const [incidentType, setIncidentType] = useState<EmergencyType>('medical');
  const [severity, setSeverity] = useState<EmergencySeverity>('critical');
  const [landmark, setLandmark] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<EmergencyReportReceipt | null>(null);

  // Mute any active audio guide upon entering Emergency View
  useEffect(() => {
    dispatchEmergencyAlertEvent({ trigger: 'emergency_view_mounted' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!landmark.trim() || !contactPhone.trim() || !details.trim()) {
      setErrorMessage('Please complete all required fields (Landmark, Contact Phone, Details).');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitEmergencyReport({
        incident_type: incidentType,
        severity,
        landmark: landmark.trim(),
        contact_phone: contactPhone.trim(),
        details: details.trim(),
      });
      setReceipt(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit emergency report. Please call 112 or 108 directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setLandmark('');
    setContactPhone('');
    setDetails('');
    setErrorMessage(null);
  };

  return (
    <div className="w-full h-full bg-slate-100 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Top Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={onBackToMap}
            className="inline-flex items-center space-x-2 text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.backToMap}</span>
          </button>
          <span className="text-xs font-semibold text-red-800 bg-red-100 px-2.5 py-1 rounded-full border border-red-300">
            Emergency Escalation Desk
          </span>
        </div>

        {/* Critical Hotline Banner */}
        <div className="p-6 bg-red-600 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-8 h-8 text-amber-300 animate-pulse flex-shrink-0" />
            <div>
              <h2 className="text-xl md:text-2xl font-black">
                {t.emergency.title}
              </h2>
              <p className="text-xs md:text-sm text-red-100 mt-0.5">
                {t.emergency.subtext}
              </p>
            </div>
          </div>

          <div className="bg-red-700/80 p-4 rounded-lg border border-red-500/50 mt-4">
            <p className="text-xs font-bold text-amber-200 uppercase tracking-wide mb-2">
              {t.emergency.directCallNotice}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="tel:112"
                className="flex items-center justify-center space-x-2 bg-white text-red-700 hover:bg-amber-100 font-extrabold text-sm py-2.5 px-4 rounded-lg shadow transition-colors"
              >
                <Phone className="w-4 h-4 text-red-600" />
                <span>{t.emergency.call112}</span>
              </a>
              <a
                href="tel:108"
                className="flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm py-2.5 px-4 rounded-lg shadow transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-slate-900" />
                <span>{t.emergency.call108}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Receipt View or Submission Form */}
        {receipt ? (
          <div className="p-6 space-y-6">
            <div className="bg-emerald-50 border-2 border-emerald-500 p-5 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-black text-emerald-950">
                    Incident Report Recorded Successfully
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Your report is queued in the Pushkaralu Control Room assistance intake queue.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">INCIDENT ID</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{receipt.id}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">TRACKING TOKEN</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 break-all">{receipt.tracking_token}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">STATUS</span>
                  <span className="inline-flex items-center space-x-1 font-bold text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="uppercase">{receipt.status}</span>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">LANDMARK</span>
                  <span className="font-semibold text-slate-800">{receipt.landmark}</span>
                </div>
              </div>

              {/* Advisory Disclaimer */}
              <div className="mt-4 bg-amber-50 border border-amber-300 p-3 rounded-lg text-xs text-amber-900 leading-relaxed font-medium">
                <strong>Notice:</strong> {receipt.advisory_notice}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs"
              >
                Submit Another Incident Report
              </button>
              <button
                onClick={onBackToMap}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Return to 3D Navigation Map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 leading-relaxed font-medium">
                <strong>Emergency Dispatch Transparency Rule:</strong> {t.emergency.formNotice}
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-500 p-3.5 rounded-lg flex items-start space-x-2 text-xs text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.emergency.categoryLabel} *
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as EmergencyType)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="medical">Medical Emergency / Ambulance Assistance</option>
                <option value="stampede_risk">Crowd Surge / Barricade Danger</option>
                <option value="drowning_risk">Riverfront / Water Rescue Distress</option>
                <option value="fire">Fire or Electrical Spark Hazard</option>
                <option value="child_distress">Unattended Child / Elder in Distress</option>
                <option value="other">Other High-Risk Incident</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Severity Level *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['critical', 'high', 'medium'] as EmergencySeverity[]).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all border ${
                      severity === sev
                        ? sev === 'critical'
                          ? 'bg-red-600 text-white border-red-700 shadow'
                          : sev === 'high'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow'
                          : 'bg-blue-600 text-white border-blue-700 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Exact Landmark or Pillar Number *
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Pushkar Ghat Steps, Pillar 14, or Gate 02"
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.emergency.contactLabel} (Indian Mobile) *
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210 or 9876543210"
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.emergency.descriptionLabel} *
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe situation, visible injuries, condition of victims, and exact surroundings..."
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg shadow-md transition-colors text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Transmitting Incident to Control Room Queue...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>{t.emergency.submitButton}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
