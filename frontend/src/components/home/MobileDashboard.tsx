import React from 'react';
import { Language, UserLocation } from '../../types';
import {
  Search,
  Map as MapIcon,
  MapPin,
  HeartPulse,
  UserX,
  UserCheck,
  BookOpen,
  Flame,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Compass,
  Navigation,
} from 'lucide-react';

export interface MobileDashboardProps {
  currentLanguage: Language;
  onLanguageChange?: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onOpenMap: () => void;
  onOpenPlaces: (categoryFilter?: string) => void;
  onOpenMedicalHelp: () => void;
  onOpenMissingPerson: () => void;
  onOpenDosDonts: () => void;
  onOpenFoundPerson: () => void;
  onOpenCrowdDensity?: () => void;
  onOpenCrowdReport?: () => void;
  onOpenEmergencyView?: () => void;
  onTriggerSos: () => void;
  userLocation?: UserLocation | null;
  activeMissingCount?: number;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  currentLanguage,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenMap,
  onOpenPlaces,
  onOpenMedicalHelp,
  onOpenMissingPerson,
  onOpenDosDonts,
  onOpenFoundPerson,
  onOpenCrowdDensity,
  onOpenCrowdReport,
  onTriggerSos,
  userLocation,
  activeMissingCount = 0,
}) => {
  // Visitor-friendly localized content across English, Telugu, and Hindi
  const content: Record<
    Language,
    {
      welcomeBadge: string;
      welcomeTitle: string;
      festivalTitle: string;
      locationSubtitle: string;
      searchPlaceholder: string;
      searchButton: string;
      mapCardTag: string;
      mapCardTitle: string;
      mapCardDesc: string;
      mapCardAction: string;
      locationReady: string;
      locationGps: string;
      servicesHeading: string;
      placesTitle: string;
      placesDesc: string;
      placesBadge: string;
      missingTitle: string;
      missingDesc: string;
      missingBadge: string;
      medicalTitle: string;
      medicalDesc: string;
      medicalBadge: string;
      foundTitle: string;
      foundDesc: string;
      foundBadge: string;
      guideTitle: string;
      guideDesc: string;
      guideBadge: string;
      crowdTitle: string;
      crowdDesc: string;
      crowdBadge: string;
      sosTitle: string;
      sosSubtitle: string;
      sosBadge: string;
    }
  > = {
    en: {
      welcomeBadge: 'Pushkaralu 2027',
      welcomeTitle: 'Welcome 👋',
      festivalTitle: 'Godavari Pushkaralu 2027',
      locationSubtitle: 'Rajahmundry Sacred Riverfront',
      searchPlaceholder: 'Where do you want to go? Search ghats, stalls...',
      searchButton: 'Go',
      mapCardTag: '3D SMART MAP',
      mapCardTitle: '3D Riverfront Smart Map',
      mapCardDesc: 'Interactive 3D simulation with walking paths, bathing ghats & temples',
      mapCardAction: 'Open 3D Map',
      locationReady: 'Location: Pushkar Ghat Area',
      locationGps: 'Live GPS Active',
      servicesHeading: 'Pilgrim Services',
      placesTitle: 'Find Places',
      placesDesc: 'Ghats, food stalls, pooja, gates, parking, water & toilets',
      placesBadge: '50 Places',
      missingTitle: 'Missing Report',
      missingDesc: 'Report a lost child or family member to helpdesk',
      missingBadge: activeMissingCount > 0 ? `${activeMissingCount} Active` : '24/7 Desk',
      medicalTitle: 'Medical Help',
      medicalDesc: 'Emergency camps, 108 ambulance & doctors on duty',
      medicalBadge: 'First Aid',
      foundTitle: 'Found Report',
      foundDesc: 'Report an unaccompanied child or elder in care',
      foundBadge: 'Reunite',
      guideTitle: "Do's & Don'ts",
      guideDesc: 'Official visitor safety rules & holy snanam guidelines',
      guideBadge: 'Safety',
      crowdTitle: 'Crowd Density',
      crowdDesc: 'Congestion heatmap & smart detours along the bund',
      crowdBadge: 'Live Map',
      sosTitle: 'EMERGENCY SOS — CALL 112 / 108',
      sosSubtitle: 'Immediate Police, Ambulance & 24/7 Pushkaralu Control Room',
      sosBadge: '24/7 Helpline',
    },
    te: {
      welcomeBadge: 'పుష్కరాలు 2027',
      welcomeTitle: 'స్వాగతం 👋',
      festivalTitle: 'గోదావరి పుష్కరాలు 2027',
      locationSubtitle: 'రాజమండ్రి పవిత్ర గోదావరి తీరం',
      searchPlaceholder: 'మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు? ఘాట్లు, స్టాల్స్...',
      searchButton: 'వెతుకు',
      mapCardTag: '3D స్మార్ట్ మ్యాప్',
      mapCardTitle: '3D నదీ తీర స్మార్ట్ మ్యాప్',
      mapCardDesc: 'నడక మార్గాలు, స్నాన ఘాట్లు మరియు దేవాలయాలతో కూడిన 3D మ్యాప్',
      mapCardAction: '3D మ్యాప్ తెరవండి',
      locationReady: 'స్థానం: పుష్కర్ ఘాట్ ప్రాంగణం',
      locationGps: 'లైవ్ GPS క్రియాశీలం',
      servicesHeading: 'ప్రధాన సేవలు',
      placesTitle: 'ప్రదేశాలు & ఘాట్లు',
      placesDesc: 'ఘాట్లు, ఆహార స్టాల్స్, ద్వారాలు, పార్కింగ్, తాగునీరు',
      placesBadge: '50 ప్రాంతాలు',
      missingTitle: 'తప్పిపోయిన వ్యక్తి',
      missingDesc: 'తప్పిపోయిన కుటుంబ సభ్యులు లేదా పిల్లల వివరాలు ఇవ్వండి',
      missingBadge: activeMissingCount > 0 ? `${activeMissingCount} నమోదులు` : '24/7 డెస్క్',
      medicalTitle: 'వైద్య సహాయం',
      medicalDesc: 'ప్రథమ చికిత్స కేంద్రాలు, 108 అంబులెన్స్, అందుబాటులో ఉన్న వైద్యులు',
      medicalBadge: 'అత్యవసరం',
      foundTitle: 'కనిపించిన వ్యక్తి',
      foundDesc: 'సంరక్షణలో ఉన్న అపరిచిత వ్యక్తి లేదా చిన్నపిల్లల సమాచారం',
      foundBadge: 'సహాయం',
      guideTitle: "నియమావళి (Do's & Don'ts)",
      guideDesc: 'పుష్కర స్నానం మరియు భద్రతకు అధికారిక మార్గదర్శకాలు',
      guideBadge: 'భద్రతా నియమాలు',
      crowdTitle: 'రద్దీ సాంద్రత',
      crowdDesc: 'రద్దీ స్థాయి హీట్‌మ్యాప్ మరియు బైపాస్ నడక మార్గాలు',
      crowdBadge: 'లైవ్ మ్యాప్',
      sosTitle: 'అత్యవసర SOS — 112 / 108 కాల్ చేయండి',
      sosSubtitle: 'పోలీస్, అంబులెన్స్ & పుష్కరాల కంట్రోల్ రూమ్ తక్షణ సహాయం',
      sosBadge: '24/7 అందుబాటు',
    },
    hi: {
      welcomeBadge: 'पुष्करालु 2027',
      welcomeTitle: 'स्वागत है 👋',
      festivalTitle: 'गोदावरी पुष्करालु 2027',
      locationSubtitle: 'राजमंड्री पवित्र गोदावरी तट',
      searchPlaceholder: 'आप कहाँ जाना चाहते हैं? घाट, स्टॉल, मंदिर खोजें...',
      searchButton: 'खोजें',
      mapCardTag: '3D स्मार्ट मैप',
      mapCardTitle: '3D रिवरफ्रंट स्मार्ट मैप',
      mapCardDesc: 'पैदल मार्गों, स्नान घाटों और मंदिरों के साथ इंटरैक्टिव 3D मैप',
      mapCardAction: '3D मैप खोलें',
      locationReady: 'स्थिति: पुष्कर घाट क्षेत्र',
      locationGps: 'लाइव GPS सक्रिय',
      servicesHeading: 'तीर्थयात्री सेवाएं',
      placesTitle: 'स्थान एवं घाट',
      placesDesc: 'स्नान घाट, भोजन स्टॉल, गेट, पार्किंग, पेयजल एवं शौचालय',
      placesBadge: '50 स्थान',
      missingTitle: 'लापता व्यक्ति',
      missingDesc: 'लापता परिजन या बच्चे की सूचना तुरंत दर्ज करें',
      missingBadge: activeMissingCount > 0 ? `${activeMissingCount} सक्रिय` : '24/7 डेस्क',
      medicalTitle: 'चिकित्सा सहायता',
      medicalDesc: 'प्राथमिक उपचार शिविर, 108 एम्बुलेंस एवं ड्यूटी डॉक्टर',
      medicalBadge: 'फर्स्ट एड',
      foundTitle: 'मिले हुए व्यक्ति',
      foundDesc: 'संरक्षण में मौजूद अकेले बच्चे या वृद्ध की सूचना दें',
      foundBadge: 'पुनर्मिलन',
      guideTitle: "दिशानिर्देश (Do's & Don'ts)",
      guideDesc: 'पवित्र स्नान और सुरक्षा के आधिकारिक नियम',
      guideBadge: 'सुरक्षा नियम',
      crowdTitle: 'भीड़ घनत्व',
      crowdDesc: 'भीड़ स्तर हीटमैप एवं स्मार्ट बाईपास पैदल मार्ग',
      crowdBadge: 'लाइव हीटमैप',
      sosTitle: 'आपातकालीन SOS — 112 / 108 डायल करें',
      sosSubtitle: 'पुलिस, एम्बुलेंस एवं 24/7 पुष्करालु कंट्रोल रूम सहायता',
      sosBadge: '24/7 हेल्पलाइन',
    },
  };

  const c = content[currentLanguage] || content.en;

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  // Handler for Crowd Density service card
  const handleCrowdCardClick = () => {
    if (onOpenCrowdDensity) {
      onOpenCrowdDensity();
    } else if (onOpenCrowdReport) {
      onOpenCrowdReport();
    } else {
      onOpenMap();
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 overflow-y-auto select-none font-sans pb-20">
      {/* 1. Attractive Godavari Riverfront Welcome Banner Card */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-teal-900 to-cyan-950 text-white rounded-b-3xl px-4 pt-4 pb-6 shadow-md overflow-hidden">
        {/* Decorative background subtle river waves */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d="M0,35 Q25,15 50,35 T100,35 L100,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Top row: Welcome Badge & Instant 1-Tap Language Selector */}
        <div className="flex items-center justify-between relative z-10 mb-2.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/60 text-[11px] font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{c.welcomeBadge}</span>
          </div>

          {/* Language Selector: EN | తెలుగు | हिन्दी */}
          <div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl p-0.5 border border-white/20 shadow-inner">
            {(['en', 'te', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange && onLanguageChange(lang)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentLanguage === lang
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-200 hover:text-white'
                }`}
                aria-label={`Switch to ${lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : 'Hindi'}`}
              >
                {lang === 'en' ? 'EN' : lang === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>

        {/* Welcome Heading */}
        <div className="relative z-10">
          <div className="text-sm font-semibold text-emerald-200 flex items-center space-x-1">
            <span>{c.welcomeTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 leading-tight">
            {c.festivalTitle}
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{c.locationSubtitle}</span>
          </p>
        </div>
      </div>

      {/* 2. Large Search Field */}
      <div className="px-4 -mt-3.5 relative z-10">
        <div className="flex items-center bg-white border-2 border-slate-200/90 hover:border-amber-400 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-400/20 rounded-2xl shadow-md px-3.5 py-2.5 transition-all">
          <Search className="w-5 h-5 text-amber-500 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            placeholder={c.searchPlaceholder}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            aria-label={c.searchPlaceholder}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 text-slate-400 hover:text-slate-700 text-xs font-bold mr-1"
              aria-label="Clear search query"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => onSearchSubmit(searchQuery.trim())}
            className="ml-1 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-sm transition-colors flex-shrink-0"
          >
            {c.searchButton}
          </button>
        </div>
      </div>

      {/* 3. Prominent 3D Map Preview Card */}
      <div className="px-4 mt-4">
        <button
          onClick={onOpenMap}
          className="w-full text-left relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-3xl p-4 shadow-xl transition-all group active:scale-[0.99]"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Status Row */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">
              <MapIcon className="w-3 h-3 text-emerald-400" />
              <span>{c.mapCardTag}</span>
            </div>

            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800/90 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>{userLocation ? c.locationGps : c.locationReady}</span>
            </div>
          </div>

          {/* Graphic Riverfront 3D Isometric Preview Mini-Banner */}
          <div className="mt-3 relative h-24 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-700/40 overflow-hidden flex items-center justify-between px-3.5">
            {/* SVG stylized map river & ghats */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,70 Q90,30 200,60 T400,40" stroke="#34d399" strokeWidth="6" fill="none" />
                <path d="M0,85 Q90,45 200,75 T400,55" stroke="#38bdf8" strokeWidth="12" fill="none" opacity="0.6" />
                <circle cx="90" cy="30" r="4" fill="#fbbf24" />
                <circle cx="200" cy="60" r="4" fill="#fbbf24" />
                <circle cx="290" cy="45" r="4" fill="#fbbf24" />
              </svg>
            </div>

            <div className="relative z-10 max-w-[70%]">
              <div className="text-sm font-black text-white group-hover:text-amber-300 transition-colors uppercase tracking-tight">
                {c.mapCardTitle}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                {c.mapCardDesc}
              </div>
            </div>

            {/* Glowing 3D Map Action Button */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg group-hover:scale-105 group-hover:from-amber-400 group-hover:to-amber-300 transition-all">
                <Navigation className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Bottom Call-To-Action Link */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
            <span className="flex items-center space-x-1.5">
              <span>{c.mapCardAction}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-medium">
              50 Ghats, Temples & Stalls
            </span>
          </div>
        </button>
      </div>

      {/* 4. Section Heading: Six Main Service Cards */}
      <div className="px-4 mt-5 mb-2.5 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          {c.servicesHeading}
        </h2>
        <span className="text-[10px] font-bold text-slate-400">
          Pushkaralu 2027
        </span>
      </div>

      {/* 5. Six Main Service Cards in a Clean 2-Column Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {/* Card 1: PLACES */}
        <button
          onClick={() => onOpenPlaces('all')}
          className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md shadow-sm text-left transition-all group active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
              {c.placesBadge}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              {c.placesTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
              {c.placesDesc}
            </p>
          </div>
        </button>

        {/* Card 2: MISSING REPORT */}
        <button
          onClick={onOpenMissingPerson}
          className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md shadow-sm text-left transition-all group active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
              <UserX className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              {c.missingBadge}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
              {c.missingTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
              {c.missingDesc}
            </p>
          </div>
        </button>

        {/* Card 3: MEDICAL HELP */}
        <button
          onClick={onOpenMedicalHelp}
          className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-md shadow-sm text-left transition-all group active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
              {c.medicalBadge}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-rose-600 transition-colors leading-tight">
              {c.medicalTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
              {c.medicalDesc}
            </p>
          </div>
        </button>

        {/* Card 4: FOUND REPORT */}
        <button
          onClick={onOpenFoundPerson}
          className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md shadow-sm text-left transition-all group active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              {c.foundBadge}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
              {c.foundTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
              {c.foundDesc}
            </p>
          </div>
        </button>

        {/* Card 5: DO'S & DON'TS */}
        <button
          onClick={onOpenDosDonts}
          className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md shadow-sm text-left transition-all group active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
              {c.guideBadge}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors leading-tight">
              {c.guideTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
              {c.guideDesc}
            </p>
          </div>
        </button>

        {/* Card 6: CROWD DENSITY */}
        <button
          onClick={handleCrowdCardClick}
          className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-400 hover:shadow-md shadow-sm text-left transition-all group active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">
              {c.crowdBadge}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
              {c.crowdTitle}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
              {c.crowdDesc}
            </p>
          </div>
        </button>
      </div>

      {/* 6. Clearly Accessible Emergency SOS Bar */}
      <div className="px-4 mt-5">
        <button
          onClick={onTriggerSos}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-700 to-red-600 hover:from-red-500 hover:to-rose-600 text-white shadow-xl border-2 border-red-300 ring-4 ring-red-500/20 active:scale-[0.98] transition-all flex items-center justify-between text-left group"
          aria-label="Emergency SOS: Call 112 or 108"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-full bg-white/20 text-white flex-shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-black/30 text-[9px] font-black uppercase tracking-wider text-amber-300 mb-0.5">
                <PhoneCall className="w-2.5 h-2.5 mr-0.5" />
                <span>{c.sosBadge}</span>
              </div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-wide drop-shadow leading-tight truncate">
                {c.sosTitle}
              </div>
              <div className="text-[10px] sm:text-[11px] text-red-100 font-medium leading-snug mt-0.5 truncate">
                {c.sosSubtitle}
              </div>
            </div>
          </div>
          <div className="w-3 h-3 rounded-full bg-amber-300 animate-ping mr-1 flex-shrink-0 ml-2" />
        </button>
      </div>
    </div>
  );
};
