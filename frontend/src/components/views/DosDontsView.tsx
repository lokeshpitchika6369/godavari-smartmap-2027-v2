import React from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface DosDontsViewProps {
  currentLanguage: Language;
  onBackToMap: () => void;
}

export const DosDontsView: React.FC<DosDontsViewProps> = ({
  currentLanguage,
  onBackToMap,
}) => {
  const t = translations[currentLanguage];

  const dosList = [
    'Follow official police, NDRF, and AP disaster management staff instructions at all times.',
    'Use only officially designated and numbered ghats, entry gates, and marked exit pathways.',
    'Keep children, elderly family members, and vulnerable persons under close visual supervision.',
    'Identify and note the nearest Help Centre, First Aid Post, and drinking water point upon arrival.',
    'Use designated municipal drinking-water kiosks and public bio-toilets along the riverfront.',
    'Keep emergency lanes, ambulance corridors, and ramp stairways completely unobstructed.',
    'Follow queue barricades and one-way crowd circulation systems at all times.',
    'Respect visitor privacy and cultural solemnity when taking photographs near holy ghats.',
  ];

  const dontsList = [
    'Do not push, surge, or move counter to crowd-flow directives during peak snanam hours.',
    'Do not enter deep water zones, barricaded river areas, or unapproved ghat edges.',
    'Do not leave children or vulnerable companions unattended at any moment.',
    'Do not block emergency access gates, fire tender pathways, or first-responder routes.',
    'Do not spread unverified rumours, panic alerts, or unconfirmed missing person notices.',
    'Do not dispose of plastic, waste, soap, shampoo, or chemical detergents into the holy Godavari.',
    'Do not interfere with public-address equipment, electrical wiring, or rescue watercraft.',
    'Do not attempt to swim or bathe under influence of alcohol or in unauthorized ghat sections.',
  ];

  return (
    <div className="w-full h-full bg-slate-100 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Top Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={onBackToMap}
            className="inline-flex items-center space-x-2 text-sm font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.backToMap}</span>
          </button>
          <span className="text-xs font-semibold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-300">
            Civic Safety Advisory
          </span>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-purple-100 text-purple-800 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                {t.dosDonts.title}
              </h2>
              <p className="text-sm text-slate-600">{t.dosDonts.subtext}</p>
            </div>
          </div>
        </div>

        {/* Do's and Don'ts Two-Column Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-base mb-4 pb-2 border-b border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3>{t.dosDonts.dosTitle}</h3>
            </div>
            <ul className="space-y-3">
              {dosList.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs md:text-sm text-emerald-950 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 text-red-900 font-extrabold text-base mb-4 pb-2 border-b border-red-200">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3>{t.dosDonts.dontsTitle}</h3>
            </div>
            <ul className="space-y-3">
              {dontsList.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs md:text-sm text-red-950 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Citations & Government Guidance */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-2 text-slate-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Official Government Guidance Citations:</span>
          </div>
          <p className="leading-relaxed">{t.dosDonts.citation}</p>
          <div className="pt-2 flex flex-wrap gap-4 text-emerald-800 font-medium">
            <a
              href="https://www.pib.gov.in/newsite/printrelease.aspx?lang=2&reg=48&relid=151549"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 hover:underline"
            >
              <span>PIB: NDMA Crowd Management Guidelines</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://eastgodavari.ap.gov.in/ghats/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 hover:underline"
            >
              <span>East Godavari District Administration: Pushkar Ghats Reference</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
