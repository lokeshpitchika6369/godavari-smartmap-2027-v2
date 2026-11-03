import React, { useState, useEffect } from 'react';
import { Language, FoundPersonPublic } from '../../types';
import { translations } from '../../i18n/translations';
import { submitFoundPersonReport, getActiveFoundPersons } from '../../services/apiService';
import {
  ArrowLeft,
  UserCheck,
  HeartHandshake,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
  Building2
} from 'lucide-react';

interface FoundPersonViewProps {
  currentLanguage: Language;
  onBackToMap: () => void;
}

export const FoundPersonView: React.FC<FoundPersonViewProps> = ({
  currentLanguage,
  onBackToMap,
}) => {
  const t = translations[currentLanguage];

  const [activeTab, setActiveTab] = useState<'form' | 'bulletin'>('form');

  // Form State
  const [approximateAge, setApproximateAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unknown'>('unknown');
  const [appearanceDescription, setAppearanceDescription] = useState<string>('');
  const [safekeepingLocation, setSafekeepingLocation] = useState<string>('');
  const [finderName, setFinderName] = useState<string>('');
  const [finderPhone, setFinderPhone] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<FoundPersonPublic | null>(null);

  // Bulletin State
  const [activeList, setActiveList] = useState<FoundPersonPublic[]>([]);
  const [isLoadingBulletin, setIsLoadingBulletin] = useState<boolean>(false);
  const [bulletinSearch, setBulletinSearch] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'bulletin') {
      loadBulletin();
    }
  }, [activeTab]);

  const loadBulletin = async () => {
    try {
      setIsLoadingBulletin(true);
      const data = await getActiveFoundPersons();
      setActiveList(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingBulletin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !approximateAge.trim() ||
      !appearanceDescription.trim() ||
      !safekeepingLocation.trim() ||
      !finderName.trim() ||
      !finderPhone.trim()
    ) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (appearanceDescription.trim().length < 10) {
      setErrorMessage(`Please provide at least 10 characters describing appearance (currently ${appearanceDescription.trim().length} chars).`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitFoundPersonReport({
        approximate_age: approximateAge.trim(),
        gender,
        appearance_description: appearanceDescription.trim(),
        current_safekeeping_location: safekeepingLocation.trim(),
        finder_contact_phone: finderPhone.trim(),
        finder_name: finderName.trim(),
      });
      setReceipt(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please escort the person to the nearest Help Camp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setApproximateAge('');
    setAppearanceDescription('');
    setSafekeepingLocation('');
    setFinderName('');
    setFinderPhone('');
    setErrorMessage(null);
  };

  const filteredBulletin = activeList.filter((item) => {
    const q = bulletinSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      item.current_safekeeping_location.toLowerCase().includes(q) ||
      item.appearance_description.toLowerCase().includes(q) ||
      item.approximate_age.toLowerCase().includes(q)
    );
  });

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
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'form'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Report Found Person
            </button>
            <button
              onClick={() => setActiveTab('bulletin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'bulletin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Persons in Helpdesk Care ({activeList.length})
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                {t.foundPerson.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600">{t.foundPerson.subtext}</p>
            </div>
          </div>
        </div>

        {activeTab === 'bulletin' ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={bulletinSearch}
                onChange={(e) => setBulletinSearch(e.target.value)}
                placeholder="Search by safe location or description..."
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-xs text-emerald-950 flex items-center space-x-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Official Care Notice:</strong> These individuals are currently accompanied safely at marked festival help camps. Family members should proceed directly to the named Help Desk with identification.
              </span>
            </div>

            {isLoadingBulletin ? (
              <div className="py-12 flex justify-center items-center text-slate-400 space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Loading helpdesk list...</span>
              </div>
            ) : filteredBulletin.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No individuals currently listed in helpdesk custody matching query.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBulletin.map((item) => (
                  <div key={item.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{item.approximate_age}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.gender.toUpperCase()} • Reported {item.reported_at}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                        UNDER OFFICIAL CARE
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.appearance_description}</p>
                    <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-100 text-xs text-slate-800 flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <div>
                        <strong>Safekeeping Location:</strong> {item.current_safekeeping_location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : receipt ? (
          <div className="p-6 space-y-6">
            <div className="bg-emerald-50 border-2 border-emerald-500 p-5 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-black text-emerald-950">
                    Found Person Report Registered
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Record ID: {receipt.id}. Thank you for your assistance.
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-white p-4 rounded-lg border border-emerald-200 text-xs space-y-2">
                <div><strong>Location:</strong> {receipt.current_safekeeping_location}</div>
                <div><strong>Description:</strong> {receipt.appearance_description}</div>
                <div><strong>Status:</strong> Under official care</div>
              </div>

              <div className="mt-4 bg-amber-50 border border-amber-300 p-3 rounded-lg text-xs text-amber-900 leading-relaxed font-medium">
                <strong>Next Step:</strong> Ensure the individual remains escorted at the designated Help Desk until festival police or verified relatives arrive.
              </div>

              <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900 leading-relaxed flex items-center justify-between">
                <div>
                  <span className="font-bold">Announcement Booth Alert:</span> {receipt.notification_notice || 'Logged (Simulation Mode - No external WhatsApp message sent)'}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 uppercase ml-2 flex-shrink-0">
                  {receipt.notification_status || 'SIMULATED'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs"
              >
                Log Another Report
              </button>
              <button
                onClick={onBackToMap}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Return to 3D Map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-start space-x-3">
              <HeartHandshake className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <strong>Official Reunification Protocol:</strong> If you have found an unaccompanied child or senior citizen, please escort them to the nearest marked <strong>Help & Information Booth</strong> immediately.
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-500 p-3.5 rounded-lg flex items-start space-x-2 text-xs text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Approximate Age *
                </label>
                <input
                  type="text"
                  value={approximateAge}
                  onChange={(e) => setApproximateAge(e.target.value)}
                  placeholder="e.g. Child (~6 yrs) or Elderly (~75 yrs)"
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.foundPerson.descriptionLabel} *
              </label>
              <textarea
                rows={3}
                value={appearanceDescription}
                onChange={(e) => setAppearanceDescription(e.target.value)}
                placeholder="Clothing color, languages spoken or understood, visible distress, personal items held..."
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.foundPerson.locationLabel} (Current Safe Booth / Outpost) *
              </label>
              <input
                type="text"
                value={safekeepingLocation}
                onChange={(e) => setSafekeepingLocation(e.target.value)}
                placeholder="e.g. Help Camp 3 near Pushkar Ghat entrance or Police Outpost 2"
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Name (Finder / Volunteer) *
                </label>
                <input
                  type="text"
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  placeholder="e.g. Volunteer / Citizen Name"
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.foundPerson.contactLabel} (Indian Mobile) *
                </label>
                <input
                  type="tel"
                  value={finderPhone}
                  onChange={(e) => setFinderPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-md transition-colors text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Logging Found Person Report...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    <span>{t.foundPerson.submitButton}</span>
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
