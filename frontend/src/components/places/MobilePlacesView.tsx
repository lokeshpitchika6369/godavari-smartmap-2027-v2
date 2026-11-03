import React, { useMemo } from 'react';

import { Facility, Language, UserLocation } from '../../types';

import { calculateHaversineDistanceMeters } from '../../services/routingService';

import { calculateEstimatedWalkMinutes } from '../../services/emergencyProximity';

import { DEFAULT_EVENT_ORIGIN } from '../../services/geolocationService';

import {

  Search,

  Navigation,

  ArrowLeft,

  X,

  MapPin,

} from 'lucide-react';



export interface MobilePlacesViewProps {

  facilities: Facility[];

  selectedFacility: Facility | null;

  onSelectFacility: (facility: Facility) => void;

  currentLanguage: Language;

  onLanguageChange?: (lang: Language) => void;

  activeCategoryFilter: string;

  onCategoryFilterChange: (category: string) => void;

  searchQuery: string;

  onSearchChange: (query: string) => void;

  onStartRoute: (facility: Facility) => void;

  onBackToHome: () => void;

  userLocation: UserLocation | null;

}



interface CategoryMeta {

  id: string;

  icon: string;

  label: Record<Language, string>;

  themeColor: string;

}



const CATEGORY_DEFINITIONS: CategoryMeta[] = [

  {

    id: 'all',

    icon: '✨',

    label: { en: 'All', te: 'అన్నీ', hi: 'सभी' },

    themeColor: 'bg-slate-100 text-slate-800 border-slate-300',

  },

  {

    id: 'poojaStalls',

    icon: '🪔',

    label: { en: 'Pooja Stalls', te: 'పూజా స్టాళ్లు', hi: 'पूजा स्टॉल' },

    themeColor: 'bg-amber-100 text-amber-900 border-amber-300',

  },

  {

    id: 'ghats',

    icon: '🌊',

    label: { en: 'Bathing Ghats', te: 'స్నాన ఘాట్లు', hi: 'स्नान घाट' },

    themeColor: 'bg-blue-100 text-blue-900 border-blue-300',

  },

  {

    id: 'foodStalls',

    icon: '🍛',

    label: { en: 'Food Stalls', te: 'ఆహార స్టాళ్లు', hi: 'भोजन स्टॉल' },

    themeColor: 'bg-orange-100 text-orange-900 border-orange-300',

  },

  {

    id: 'gates',

    icon: '🚪',

    label: { en: 'Entry Gates', te: 'ప్రవేశ ద్వారాలు', hi: 'ప్రవేశ ద్వార్' },

    themeColor: 'bg-amber-100 text-amber-900 border-amber-300',

  },

  {

    id: 'parking',

    icon: '🅿️',

    label: { en: 'Parking', te: 'పార్కింగ్', hi: 'पार्किंग' },

    themeColor: 'bg-purple-100 text-purple-900 border-purple-300',

  },

  {

    id: 'temples',

    icon: '🛕',

    label: { en: 'Temples', te: 'దేవాలయాలు', hi: 'मंदिर' },

    themeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',

  },

  {

    id: 'medical',

    icon: '🏥',

    label: { en: 'Medical', te: 'వైద్యం', hi: 'चिकित्सा' },

    themeColor: 'bg-red-100 text-red-900 border-red-300',

  },

  {

    id: 'toilets',

    icon: '🚻',

    label: { en: 'Toilets', te: 'శౌచాలయాలు', hi: 'शौचालय' },

    themeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',

  },

  {

    id: 'water',

    icon: '💧',

    label: { en: 'Drinking Water', te: 'మంచినీరు', hi: 'पीने का पानी' },

    themeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',

  },

  {

    id: 'waitingHalls',

    icon: '⏳',

    label: { en: 'Waiting Halls', te: 'విశ్రాంతి భవనాలు', hi: 'विश्राम हॉल' },

    themeColor: 'bg-teal-100 text-teal-900 border-teal-300',

  },

  {

    id: 'helpCentres',

    icon: 'ℹ️',

    label: { en: 'Help Centres', te: 'సహాయ కేంద్రాలు', hi: 'सहायता केंद्र' },

    themeColor: 'bg-sky-100 text-sky-900 border-sky-300',

  },

  {

    id: 'busStops',

    icon: '🚌',

    label: { en: 'Bus Stops', te: 'బస్ స్టాపులు', hi: 'बस स्टॉप' },

    themeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',

  },

  {

    id: 'announcements',

    icon: '📢',

    label: { en: 'Announcements', te: 'ప్రకటనలు', hi: 'घोषणाएं' },

    themeColor: 'bg-pink-100 text-pink-900 border-pink-300',

  },

  {

    id: 'lockers',

    icon: '🔒',

    label: { en: 'Lockers', te: 'లాకర్లు', hi: 'लॉकर' },

    themeColor: 'bg-zinc-100 text-zinc-900 border-zinc-300',

  },

];



export const MobilePlacesView: React.FC<MobilePlacesViewProps> = ({

  facilities,

  selectedFacility,

  onSelectFacility,

  currentLanguage,

  onLanguageChange,

  activeCategoryFilter,

  onCategoryFilterChange,

  searchQuery,

  onSearchChange,

  onStartRoute: _onStartRoute,

  onBackToHome,

  userLocation,

}) => {

  // Base coordinates for real-time proximity calculation [lat, lng]

  const referenceCoords: [number, number] = useMemo(() => {

    if (userLocation) {

      return [userLocation.lat, userLocation.lng];

    }

    return [DEFAULT_EVENT_ORIGIN.lat, DEFAULT_EVENT_ORIGIN.lng];

  }, [userLocation]);



  // Dynamic count per category across all facilities

  const categoryCounts = useMemo(() => {

    const counts: Record<string, number> = { all: facilities.length };

    for (const f of facilities) {

      counts[f.category] = (counts[f.category] || 0) + 1;

    }

    return counts;

  }, [facilities]);



  // Enhanced facilities with computed live distance and ETA

  const facilitiesWithDistance = useMemo(() => {

    return facilities.map((fac) => {

      const distanceMeters = calculateHaversineDistanceMeters(referenceCoords, fac.coordinates);

      const walkMinutes = calculateEstimatedWalkMinutes(distanceMeters);

      return {

        ...fac,

        distanceMeters,

        walkMinutes,

      };

    });

  }, [facilities, referenceCoords]);



  // Filter facilities by active category and search query

  const filteredFacilities = useMemo(() => {

    const query = searchQuery.trim().toLowerCase();



    return facilitiesWithDistance

      .filter((fac) => {

        // Category check

        if (activeCategoryFilter !== 'all') {
          if (activeCategoryFilter === 'poojaStalls') {
            if (fac.category !== 'poojaStalls' && fac.category !== 'poojaAreas') return false;
          } else if (activeCategoryFilter === 'parking') {
            if (fac.category !== 'parking' && fac.category !== 'busStops') return false;
          } else if (fac.category !== activeCategoryFilter) {
            return false;
          }
        }



        // Search query check

        if (!query) return true;



        const nameEn = fac.name.en?.toLowerCase() || '';

        const nameTe = fac.name.te?.toLowerCase() || '';

        const nameHi = fac.name.hi?.toLowerCase() || '';

        const descEn = fac.description?.en?.toLowerCase() || '';

        const descTe = fac.description?.te?.toLowerCase() || '';

        const descHi = fac.description?.hi?.toLowerCase() || '';

        const category = fac.category?.toLowerCase() || '';



        return (

          nameEn.includes(query) ||

          nameTe.includes(query) ||

          nameHi.includes(query) ||

          descEn.includes(query) ||

          descTe.includes(query) ||

          descHi.includes(query) ||

          category.includes(query)

        );

      })

      .sort((a, b) => a.distanceMeters - b.distanceMeters); // Sort closest to user first

  }, [facilitiesWithDistance, activeCategoryFilter, searchQuery]);



  // Category badge helper

  const getCategoryMeta = (catId: string): CategoryMeta => {

    const found = CATEGORY_DEFINITIONS.find((c) => c.id === catId);

    if (found) return found;

    return {

      id: catId,

      icon: '📍',

      label: { en: catId, te: catId, hi: catId },

      themeColor: 'bg-slate-100 text-slate-800 border-slate-300',

    };

  };



  // Localized UI strings

  const labels = {

    title: { en: 'Find Places', te: 'ప్రదేశాలు కనుగొనండి', hi: 'स्थान खोजें' }[currentLanguage],

    totalPlaces: {

      en: `${facilities.length} Places`,

      te: `${facilities.length} ప్రదేశాలు`,

      hi: `${facilities.length} स्थान`,

    }[currentLanguage],

    searchPlaceholder: {

      en: 'Search pooja stalls, ghats, food, gates...',

      te: 'పూజా స్టాళ్లు, ఘాట్లు, భోజనం, ద్వారాలు శోధించండి...',

      hi: 'पूजा स्टॉल, घाट, भोजन, द्वार खोजें...',

    }[currentLanguage],

    navigateHere: { en: 'Navigate Here', te: 'ఇక్కడికి దారి', hi: 'यहाँ नेविगेट करें' }[currentLanguage],

    noResults: {

      en: 'No facilities match your search',

      te: 'మీ శోధనకు సరిపోలే ప్రదేశాలు లేవు',

      hi: 'आपकी खोज से मेल खाता कोई स्थान नहीं मिला',

    }[currentLanguage],

    clearFilter: { en: 'Show All Places', te: 'అన్ని ప్రదేశాలు చూపించు', hi: 'सभी स्थान दिखाएं' }[

      currentLanguage

    ],

  };



  return (

    <div className="flex flex-col h-full w-full bg-slate-50 text-slate-800 overflow-hidden font-sans select-none">

      {/* 1. Header Bar (44px) */}

      <div className="h-11 bg-emerald-900 border-b-2 border-amber-500 text-white px-3 flex items-center justify-between shrink-0 shadow-md">

        <div className="flex items-center space-x-2">

          <button

            onClick={onBackToHome}

            className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-amber-300 font-bold text-xs flex items-center space-x-1 transition-all"

            aria-label="Back to Home Dashboard"

          >

            <ArrowLeft className="w-3.5 h-3.5" />

            <span>Home</span>

          </button>

          <span className="text-xs font-black uppercase text-amber-300 tracking-wide">

            {labels.title}

          </span>

        </div>



        <div className="flex items-center space-x-1.5">

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-800 text-amber-200 border border-emerald-700 font-bold">

            {labels.totalPlaces}

          </span>

          {onLanguageChange && (

            <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/10 text-[10px] font-bold">

              {(['en', 'te', 'hi'] as Language[]).map((lang) => (

                <button

                  key={lang}

                  onClick={() => onLanguageChange(lang)}

                  className={`px-1.5 py-0.5 rounded ${

                    currentLanguage === lang

                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'

                      : 'text-slate-300 hover:text-white'

                  }`}

                >

                  {lang.toUpperCase()}

                </button>

              ))}

            </div>

          )}

        </div>

      </div>



      {/* 2. Sticky Search Bar (50px) */}

      <div className="p-2.5 bg-white border-b border-slate-200 shadow-sm shrink-0">

        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">

          <Search className="w-4 h-4 text-amber-500 mr-2 shrink-0" />

          <input

            type="text"

            value={searchQuery}

            onChange={(e) => onSearchChange(e.target.value)}

            placeholder={labels.searchPlaceholder}

            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-medium"

          />

          {searchQuery && (

            <button

              onClick={() => onSearchChange('')}

              className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1"

              aria-label="Clear search"

            >

              <X className="w-3.5 h-3.5" />

            </button>

          )}

        </div>

      </div>



      {/* 3. Horizontal Scrolling Category Bar (44px) */}

      <div className="h-11 bg-slate-100 border-b border-slate-200 py-1.5 px-3 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">

        {CATEGORY_DEFINITIONS.map((cat) => {

          const isActive = activeCategoryFilter === cat.id;

          const count = categoryCounts[cat.id] || 0;



          // Don't show categories that have 0 facilities unless 'all'

          if (count === 0 && cat.id !== 'all') return null;



          return (

            <button

              key={cat.id}

              onClick={() => onCategoryFilterChange(cat.id)}

              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all flex items-center space-x-1 shrink-0 ${

                isActive

                  ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400/50 scale-[1.02]'

                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm font-bold'

              }`}

            >

              <span>{cat.icon}</span>

              <span>{cat.label[currentLanguage] || cat.label.en}</span>

              <span

                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${

                  isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-100 text-slate-500'

                }`}

              >

                {count}

              </span>

            </button>

          );

        })}

      </div>



      {/* 4. Scrollable Places List */}

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">

        {filteredFacilities.length === 0 ? (

          <div className="py-12 px-4 text-center">

            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl mb-3 shadow-inner">

              🔍

            </div>

            <h3 className="text-sm font-black text-slate-800">{labels.noResults}</h3>

            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">

              Try searching with another keyword or select a different category above.

            </p>

            {(activeCategoryFilter !== 'all' || searchQuery) && (

              <button

                onClick={() => {

                  onCategoryFilterChange('all');

                  onSearchChange('');

                }}

                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all"

              >

                {labels.clearFilter}

              </button>

            )}

          </div>

        ) : (

          filteredFacilities.map((facility) => {

            const isSelected = selectedFacility?.id === facility.id;

            const meta = getCategoryMeta(facility.category);

            const facilityName = facility.name[currentLanguage] || facility.name.en;

            const facilityDesc = facility.description?.[currentLanguage] || facility.description?.en || '';



            return (

              <div

                key={facility.id}

                onClick={() => onSelectFacility(facility)}

                className={`p-3 rounded-2xl bg-white border transition-all duration-150 cursor-pointer shadow-sm relative ${

                  isSelected

                    ? 'border-amber-500 ring-2 ring-amber-400/50 bg-amber-50/60'

                    : 'border-slate-200 hover:border-slate-300'

                }`}

              >

                {/* Header row: Category Chip & Distance Tag */}

                <div className="flex items-start justify-between gap-2">

                  <div className="flex items-start space-x-2 min-w-0">

                    <span className="text-lg shrink-0 mt-0.5">{meta.icon}</span>

                    <div className="min-w-0">

                      <span

                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border inline-block ${meta.themeColor}`}

                      >

                        {meta.label[currentLanguage] || meta.label.en}

                      </span>

                      <h3 className="text-xs font-black text-slate-900 mt-1 leading-snug truncate">

                        {facilityName}

                      </h3>

                    </div>

                  </div>



                  {/* Distance Badge */}

                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 flex items-center space-x-1">

                    <MapPin className="w-2.5 h-2.5" />

                    <span>

                      {facility.distanceMeters < 1000

                        ? `${Math.round(facility.distanceMeters)}m`

                        : `${(facility.distanceMeters / 1000).toFixed(1)}km`}{' '}

                      ({facility.walkMinutes}m)

                    </span>

                  </span>

                </div>



                {/* Description */}

                {facilityDesc && (

                  <p className="text-[11px] text-slate-500 mt-1.5 leading-snug line-clamp-2">

                    {facilityDesc}

                  </p>

                )}



                {/* Action Button: Select Facility & View Details */}

                <button

                  type="button"

                  onClick={(e) => {

                    e.stopPropagation();

                    onSelectFacility(facility);

                  }}

                  className="mt-2.5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all"

                >

                  <Navigation className="w-3.5 h-3.5 stroke-[2.5]" />

                  <span>{labels.navigateHere}</span>

                </button>

              </div>

            );

          })

        )}

      </div>

    </div>

  );

};

