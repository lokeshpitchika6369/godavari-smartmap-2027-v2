import React, { useState, useEffect } from 'react';
import { Language, MissingPersonReceipt, MissingPersonPublic } from '../../types';
import { translations } from '../../i18n/translations';
import { submitMissingPersonReport, getActiveMissingPersons } from '../../services/apiService';
import {
  ArrowLeft,
  UserX,
  ShieldAlert,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search
} from 'lucide-react';

interface MissingPersonViewProps {
  currentLanguage: Language;
  onBackToMap: () => void;
}

export const MissingPersonView: React.FC<MissingPersonViewProps> = ({
  currentLanguage,
  onBackToMap,
}) => {
  const t = translations[currentLanguage];

  const [activeTab, setActiveTab] = useState<'form' | 'bulletin'>('form');

  // Form State
  const [personName, setPersonName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [description, setDescription] = useState<string>('');
  const [lastSeenLocation, setLastSeenLocation] = useState<string>('');
  const [lastSeenTime, setLastSeenTime] = useState<string>('');
  const [clothingDetails, setClothingDetails] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Parent');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<MissingPersonReceipt | null>(null);

  // Bulletin State
  const [activeList, setActiveList] = useState<MissingPersonPublic[]>([]);
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
      const data = await getActiveMissingPersons();
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

    const errors: Record<string, string> = {};

    if (personName.trim().length < 2) {
      errors.personName = 'Please enter a person name (at least 2 characters).';
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      errors.age = 'Please enter a valid age between 0 and 120.';
    }

    if (description.trim().length < 10) {
      errors.description = `Physical description must have at least 10 characters (currently ${description.trim().length} chars).`;
    }

    if (lastSeenLocation.trim().length < 3) {
      errors.lastSeenLocation = 'Please specify the last seen location (at least 3 characters).';
    }

    if (contactName.trim().length < 2) {
      errors.contactName = 'Please enter your full name (at least 2 characters).';
    }

    const cleanPhone = contactPhone.replace(/[\s-]/g, '').replace(/^\+91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.contactPhone = 'Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(errors.description || Object.values(errors)[0]);
      return;
    }

    setFieldErrors({});

    try {
      setIsSubmitting(true);
      const res = await submitMissingPersonReport({
        person_name: personName.trim(),
        age: parsedAge,
        gender,
        description: description.trim(),
        last_seen_location: lastSeenLocation.trim(),
        last_seen_time: lastSeenTime.trim() || 'Earlier today',
        clothing_details: clothingDetails.trim() || undefined,
        contact_phone: contactPhone.trim(),
        contact_name: contactName.trim(),
        relationship: relationship.trim(),
      });
      setReceipt(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please visit the nearest Police Assistance Outpost.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setPersonName('');
    setAge('');
    setDescription('');
    setLastSeenLocation('');
    setLastSeenTime('');
    setClothingDetails('');
    setContactPhone('');
    setContactName('');
    setErrorMessage(null);
    setFieldErrors({});
  };

  const filteredBulletin = activeList.filter((item) => {
    const q = bulletinSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      item.person_name.toLowerCase().includes(q) ||
      item.last_seen_location.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
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
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Register Report
            </button>
            <button
              onClick={() => setActiveTab('bulletin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'bulletin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Active Bulletin ({activeList.length})
            </button>
          </div>
        </div>

        {/* Content Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-lg">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                {t.missingPerson.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600">{t.missingPerson.subtext}</p>
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
                placeholder="Search active bulletin by person name or location..."
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Privacy Protected:</strong> Public contact details are redacted. If you recognize anyone, visit the Central Lost & Found Booth or call <strong>+91 883 2460100</strong>.
              </span>
            </div>

            {isLoadingBulletin ? (
              <div className="py-12 flex justify-center items-center text-slate-400 space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Loading active bulletin...</span>
              </div>
            ) : filteredBulletin.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active missing person reports found matching query.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBulletin.map((item) => (
                  <div key={item.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{item.person_name}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.age} yrs • {item.gender.toUpperCase()} • Reported {item.reported_at}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div><strong>Last Seen:</strong> {item.last_seen_location} ({item.last_seen_time})</div>
                      <div><strong>Reporter:</strong> {item.contact_name_masked} ({item.contact_phone_masked})</div>
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
                    Missing Person Case Registered
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Case is now active in the Central Lost & Found Assistance Queue.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">CASE ID</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{receipt.id}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">TRACKING TOKEN</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 break-all">{receipt.tracking_token}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">PERSON NAME</span>
                  <span className="font-bold text-slate-900">{receipt.person_name} ({receipt.age} yrs)</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <span className="text-slate-500 font-bold block">LAST SEEN</span>
                  <span className="font-semibold text-slate-800">{receipt.last_seen_location}</span>
                </div>
              </div>

              <div className="mt-4 bg-amber-50 border border-amber-300 p-3 rounded-lg text-xs text-amber-900 leading-relaxed font-medium">
                <strong>Next Step:</strong> Please proceed to the nearest Pushkaralu Police Booth or Central Lost & Found Desk at Pushkar Ghat to coordinate directly with festival staff.
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
                Register Another Person
              </button>
              <button
                onClick={() => setActiveTab('bulletin')}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
              >
                View Active Bulletins
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Data Protection & Verification:</strong> All submitted details are reviewed directly by the Pushkaralu lost & found administrative desk. Personal contact numbers and sensitive information are masked in public feeds.
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-500 p-3.5 rounded-lg flex items-start space-x-2 text-xs text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.missingPerson.nameLabel} *
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => {
                    setPersonName(e.target.value);
                    if (fieldErrors.personName && e.target.value.trim().length >= 2) {
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.personName;
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-colors ${
                    fieldErrors.personName
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                />
                {fieldErrors.personName && (
                  <p className="text-xs font-semibold text-red-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
                    <span>{fieldErrors.personName}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.missingPerson.ageLabel} (Years) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (fieldErrors.age) {
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.age;
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g. 8"
                  required
                  className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-colors ${
                    fieldErrors.age
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                />
                {fieldErrors.age && (
                  <p className="text-xs font-semibold text-red-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
                    <span>{fieldErrors.age}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Approximate Time of Separation *
                </label>
                <input
                  type="text"
                  value={lastSeenTime}
                  onChange={(e) => {
                    setLastSeenTime(e.target.value);
                    if (fieldErrors.lastSeenTime) {
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.lastSeenTime;
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g. Around 10:30 AM after bathing"
                  required
                  className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-colors ${
                    fieldErrors.lastSeenTime
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                />
                {fieldErrors.lastSeenTime && (
                  <p className="text-xs font-semibold text-red-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
                    <span>{fieldErrors.lastSeenTime}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.missingPerson.lastSeenLabel} *
              </label>
              <input
                type="text"
                value={lastSeenLocation}
                onChange={(e) => {
                  setLastSeenLocation(e.target.value);
                  if (fieldErrors.lastSeenLocation && e.target.value.trim().length >= 3) {
                    setFieldErrors(prev => {
                      const next = { ...prev };
                      delete next.lastSeenLocation;
                      return next;
                    });
                  }
                }}
                placeholder="e.g. Near Kotilingala Ghat bathing step 4 or Water Station 2"
                required
                className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-colors ${
                  fieldErrors.lastSeenLocation
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                }`}
              />
              {fieldErrors.lastSeenLocation && (
                <p className="text-xs font-semibold text-red-600 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
                  <span>{fieldErrors.lastSeenLocation}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Physical Description & Languages Spoken *
                </label>
                <span className={`text-[11px] font-bold ${description.trim().length >= 10 ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {description.trim().length}/10 min chars
                </span>
              </div>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description && e.target.value.trim().length >= 10) {
                    setFieldErrors(prev => {
                      const next = { ...prev };
                      delete next.description;
                      return next;
                    });
                  }
                }}
                placeholder="Height, hair style, languages spoken, distinguishing marks or tattoos (min 10 characters)..."
                required
                className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-colors ${
                  fieldErrors.description
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                }`}
              />
              {fieldErrors.description && (
                <p className="text-xs font-semibold text-red-600 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
                  <span>{fieldErrors.description}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Clothing Details (Optional)
              </label>
              <input
                type="text"
                value={clothingDetails}
                onChange={(e) => setClothingDetails(e.target.value)}
                placeholder="e.g. Yellow kurta, white pyjama, brown sandals"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => {
                    setContactName(e.target.value);
                    if (fieldErrors.contactName && e.target.value.trim().length >= 2) {
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.contactName;
                        return next;
                      });
                    }
                  }}
                  placeholder="e.g. Sunita Sharma"
                  required
                  className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-colors ${
                    fieldErrors.contactName
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                />
                {fieldErrors.contactName && (
                  <p className="text-xs font-semibold text-red-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
                    <span>{fieldErrors.contactName}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Relationship *
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Mother, Father, Spouse"
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.missingPerson.contactLabel} (Indian Mobile) *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (fieldErrors.contactPhone) {
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.contactPhone;
                        return next;
                      });
                    }
                  }}
                  placeholder="+91 98765 43210"
                  required
                  className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-none transition-colors ${
                    fieldErrors.contactPhone
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                />
                {fieldErrors.contactPhone && (
                  <p className="text-xs font-semibold text-red-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1 flex-shrink-0" />
                    <span>{fieldErrors.contactPhone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{t.missingPerson.privacyNotice}</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg shadow-md transition-colors text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registering Case with Control Desk...</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-5 h-5" />
                    <span>{t.missingPerson.submitButton}</span>
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
