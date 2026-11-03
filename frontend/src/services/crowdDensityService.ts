import { Language, CrowdZoneDensity, CrowdDensityZone } from '../types';

export type CrowdSimulationPreset =
  | 'peak_snanam_rush'
  | 'evening_aarti_rush'
  | 'normal_flow'
  | 'all_clear';

export const SIMULATED_DATA_DISCLAIMER =
  'Simulated Crowd Density Data — For pushkaralu crowd management planning & demonstration purposes only. Not connected to live sensor hardware.';

export const CROWD_DISCLAIMER_I18N: Record<Language, string> = {
  en: 'Simulated Crowd Density Data — For pushkaralu crowd management planning & demonstration purposes only. Not connected to live sensor hardware.',
  te: 'అనుకరణ రద్దీ సాంద్రత డేటా — పుష్కరాల ప్రణాళిక మరియు ప్రదర్శన కొరకు మాత్రమే. ప్రత్యక్ష సెన్సార్ పరికరాలకు కనెక్ట్ చేయబడలేదు.',
  hi: 'सिम्युलेटेड भीड़ घनत्व डेटा — पुष्करालु योजना एवं प्रदर्शन के उद्देश्य से। लाइव सेंसर हार्डवेयर से कनेक्ट नहीं है।',
};

export const CROWD_PRESET_METADATA: Record<
  CrowdSimulationPreset,
  {
    name: Record<Language, string>;
    description: Record<Language, string>;
    badgeColor: string;
  }
> = {
  peak_snanam_rush: {
    name: {
      en: 'Peak Snanam Rush (Morning Holy Dip)',
      te: 'ప్రధాన స్నాన రద్దీ (ఉదయ పవిత్ర స్నానం)',
      hi: 'शिखर स्नान भीड़ (प्रातः पवित्र स्नान)',
    },
    description: {
      en: 'Critical density at Pushkar Ghat main pavilion and bathing platforms. Upper bund bypass recommended.',
      te: 'పుష్కర్ ఘాట్ ప్రధాన మండపం వద్ద తీవ్ర రద్దీ. ఎగువ బండ్ ప్రత్యామ్నాయ మార్గం సూచించబడింది.',
      hi: 'पुष्कर घाट मुख्य मंडप पर अत्यधिक भीड़। ऊपरी तटबंध बाईपास अनुशंसित।',
    },
    badgeColor: 'bg-red-900/80 text-red-200 border-red-500',
  },
  evening_aarti_rush: {
    name: {
      en: 'Evening Aarti & Deepotsavam Rush',
      te: 'సాయంత్ర హారతి & దీపోత్సవ రద్దీ',
      hi: 'संध्या आरती एवं दीपोत्सव भीड़',
    },
    description: {
      en: 'High congestion near Markandeya Temple and riverfront steps for divine aarti viewing.',
      te: 'మార్కండేయ స్వామి ఆలయం మరియు నదీ మెట్ల వద్ద సాయంత్ర హారతి దర్శనార్థుల రద్దీ.',
      hi: 'मार्कंडेय मंदिर और नदी की सीढ़ियों पर दिव्य आरती दर्शन हेतु भारी भीड़।',
    },
    badgeColor: 'bg-orange-900/80 text-orange-200 border-orange-500',
  },
  normal_flow: {
    name: {
      en: 'Normal Daytime Flow',
      te: 'సాధారణ పగటి ప్రవాహం',
      hi: 'सामान्य दिनचर्या प्रवाह',
    },
    description: {
      en: 'Steady flow across all ghats with minor queue times. Standard pedestrian corridors active.',
      te: 'అన్ని ఘాట్లలో స్వల్ప నిరీక్షణతో సమాన ప్రవాహం. సాధారణ నడక మార్గాలు క్రియాశీలం.',
      hi: 'सभी घाटों पर सुचारू प्रवाह। सामान्य पैदल गलियारे सक्रिय।',
    },
    badgeColor: 'bg-amber-900/80 text-amber-200 border-amber-500',
  },
  all_clear: {
    name: {
      en: 'All Clear (Low Density Off-Peak)',
      te: 'రద్దీ రహితం (ఆఫ్-పీక్ వేళలు)',
      hi: 'सुगम आवागमन (भीड़-मुक्त समय)',
    },
    description: {
      en: 'Minimal crowd presence across entire corridor. Unrestricted pedestrian movement.',
      te: 'మొత్తం కారిడార్‌లో అతి తక్కువ రద్దీ. ఎటువంటి ఆటంకం లేని నడక మార్గాలు.',
      hi: 'संपूर्ण गलियारे में न्यूनतम भीड़। अबाध पैदल आवागमन।',
    },
    badgeColor: 'bg-emerald-900/80 text-emerald-200 border-emerald-500',
  },
};

export const CROWD_ZONE_DEFINITIONS = [
  {
    id: 'zone-pushkar-center',
    nodeId: 'node-promenade-pushkar-center',
    name: {
      en: 'Pushkar Ghat Central VIP Pavilion',
      te: 'పుష్కర్ ఘాట్ ప్రధాన కేంద్ర మండపం',
      hi: 'पुष्कर घाट मुख्य केंद्रीय मंडप',
    },
    coordinates: [17.00150, 81.77875] as [number, number],
  },
  {
    id: 'zone-pushkar-north',
    nodeId: 'node-promenade-pushkar-north',
    name: {
      en: 'Pushkar Ghat North Bathing Platform',
      te: 'పుష్కర్ ఘాట్ ఉత్తర స్నాన వేదిక',
      hi: 'पुष्कर घाट उत्तर स्नान मंच',
    },
    coordinates: [17.00204, 81.77856] as [number, number],
  },
  {
    id: 'zone-pinda-mandapam',
    nodeId: 'node-promenade-pinda-mandapam',
    name: {
      en: 'Pinda Pradanam Covered Mandapam',
      te: 'పిండ ప్రదాన కవర్డ్ మండపం',
      hi: 'पिंड दान कवर्ड मंडप',
    },
    coordinates: [16.99862, 81.78119] as [number, number],
  },
  {
    id: 'zone-temple-steps',
    nodeId: 'node-promenade-temple',
    name: {
      en: 'Sri Markandeya Swamy Temple Steps',
      te: 'శ్రీ మార్కండేయ స్వామి దేవాలయ మెట్లు',
      hi: 'श्री मार्कंडेय स्वामी मंदिर सीढ़ियां',
    },
    coordinates: [17.00384, 81.77894] as [number, number],
  },
  {
    id: 'zone-pooja-strip',
    nodeId: 'node-promenade-pooja-strip',
    name: {
      en: 'Holy Water Canister & Pooja Stalls Strip',
      te: 'పవిత్ర జలాల పాత్రలు & పూజా స్టాళ్ల మార్గం',
      hi: 'पवित्र जल पात्र एवं पूजा स्टॉल पट्टी',
    },
    coordinates: [16.99916, 81.78176] as [number, number],
  },
  {
    id: 'zone-kotilingala-steps',
    nodeId: 'node-promenade-kotilingala',
    name: {
      en: 'Kotilingala Ghat 01 Steps',
      te: 'కోటిలింగాల ఘాట్ 01 మెట్లు',
      hi: 'कोटिशिवलिंग घाट 01 सीढ़ियां',
    },
    coordinates: [17.00691, 81.77555] as [number, number],
  },
  {
    id: 'zone-saraswati-terrace',
    nodeId: 'node-promenade-saraswati',
    name: {
      en: 'Saraswati Ghat 03 River Terrace',
      te: 'సరస్వతి ఘాట్ 03 నదీ తీరం',
      hi: 'सरस्वती घाट 03 नदी तट',
    },
    coordinates: [16.99564, 81.78326] as [number, number],
  },
  {
    id: 'zone-bund-central',
    nodeId: 'node-bund-central-arch',
    name: {
      en: 'Central Main Gate 02 (Pushkar Arch)',
      te: 'కేంద్ర ప్రధాన ద్వారం 02 (పుష్కర్ ఆర్చ్)',
      hi: 'केंद्रीय मुख्य द्वार 02 (पुष्कर मेहराब)',
    },
    coordinates: [17.00180, 81.78119] as [number, number],
  },
  {
    id: 'zone-bund-helpdesk',
    nodeId: 'node-bund-helpdesk-lockers',
    name: {
      en: 'Central Helpdesk & Secure Lockers Plaza',
      te: 'ప్రధాన సహాయ కేంద్రం & లాకర్ల ప్రాంగణం',
      hi: 'केंद्रीय सहायता डेस्क एवं लॉकर प्लाजा',
    },
    coordinates: [17.00114, 81.78232] as [number, number],
  },
];

// Zone density levels per preset
const PRESET_DENSITY_MAP: Record<
  CrowdSimulationPreset,
  Record<string, { density: CrowdZoneDensity; waitMin: number }>
> = {
  peak_snanam_rush: {
    'zone-pushkar-center': { density: 'critical', waitMin: 45 },
    'zone-pushkar-north': { density: 'critical', waitMin: 40 },
    'zone-pinda-mandapam': { density: 'high', waitMin: 25 },
    'zone-temple-steps': { density: 'medium', waitMin: 15 },
    'zone-pooja-strip': { density: 'medium', waitMin: 12 },
    'zone-kotilingala-steps': { density: 'medium', waitMin: 10 },
    'zone-saraswati-terrace': { density: 'low', waitMin: 3 },
    'zone-bund-central': { density: 'low', waitMin: 2 },
    'zone-bund-helpdesk': { density: 'low', waitMin: 2 },
  },
  evening_aarti_rush: {
    'zone-pushkar-center': { density: 'critical', waitMin: 35 },
    'zone-temple-steps': { density: 'high', waitMin: 30 },
    'zone-pushkar-north': { density: 'high', waitMin: 25 },
    'zone-pooja-strip': { density: 'medium', waitMin: 15 },
    'zone-kotilingala-steps': { density: 'medium', waitMin: 12 },
    'zone-pinda-mandapam': { density: 'medium', waitMin: 10 },
    'zone-saraswati-terrace': { density: 'medium', waitMin: 8 },
    'zone-bund-central': { density: 'low', waitMin: 3 },
    'zone-bund-helpdesk': { density: 'low', waitMin: 2 },
  },
  normal_flow: {
    'zone-pushkar-center': { density: 'medium', waitMin: 10 },
    'zone-pushkar-north': { density: 'medium', waitMin: 8 },
    'zone-temple-steps': { density: 'medium', waitMin: 10 },
    'zone-pooja-strip': { density: 'low', waitMin: 4 },
    'zone-kotilingala-steps': { density: 'low', waitMin: 4 },
    'zone-pinda-mandapam': { density: 'low', waitMin: 5 },
    'zone-saraswati-terrace': { density: 'low', waitMin: 2 },
    'zone-bund-central': { density: 'low', waitMin: 1 },
    'zone-bund-helpdesk': { density: 'low', waitMin: 1 },
  },
  all_clear: {
    'zone-pushkar-center': { density: 'low', waitMin: 1 },
    'zone-pushkar-north': { density: 'low', waitMin: 1 },
    'zone-temple-steps': { density: 'low', waitMin: 1 },
    'zone-pooja-strip': { density: 'low', waitMin: 1 },
    'zone-kotilingala-steps': { density: 'low', waitMin: 1 },
    'zone-pinda-mandapam': { density: 'low', waitMin: 1 },
    'zone-saraswati-terrace': { density: 'low', waitMin: 1 },
    'zone-bund-central': { density: 'low', waitMin: 1 },
    'zone-bund-helpdesk': { density: 'low', waitMin: 1 },
  },
};

export const CROWD_FACTOR_MAP: Record<
  CrowdZoneDensity,
  {
    factor: number;
    multiplierText: string;
    colorHex: string;
    colorThreeHex: number;
    description: Record<Language, string>;
  }
> = {
  low: {
    factor: 0.0,
    multiplierText: '1.0x',
    colorHex: '#10b981', // Emerald
    colorThreeHex: 0x10b981,
    description: {
      en: 'Low Density — Free pedestrian flow (multiplier: 1.0x)',
      te: 'తక్కువ రద్దీ — సాఫీగా సాగే నడక (గుణకం: 1.0x)',
      hi: 'कम भीड़ — सुगम पैदल आवागमन (गुणक: 1.0x)',
    },
  },
  medium: {
    factor: 0.5,
    multiplierText: '1.5x',
    colorHex: '#f59e0b', // Amber
    colorThreeHex: 0xf59e0b,
    description: {
      en: 'Medium Density — Moderate movement (multiplier: 1.5x)',
      te: 'మధ్యస్థ రద్దీ — మోస్తరు రద్దీ ప్రవాహం (గుణకం: 1.5x)',
      hi: 'मध्यम भीड़ — सामान्य आवाजाही (गुणक: 1.5x)',
    },
  },
  high: {
    factor: 1.2,
    multiplierText: '2.2x',
    colorHex: '#f97316', // Orange
    colorThreeHex: 0xf97316,
    description: {
      en: 'High Density — Heavy queues & slow pace (multiplier: 2.2x)',
      te: 'అధిక రద్దీ — నెమ్మదిగా కదిలే వరుసలు (గుణకం: 2.2x)',
      hi: 'उच्च भीड़ — धीमी गति एवं लंबी कतारें (गुणक: 2.2x)',
    },
  },
  critical: {
    factor: 2.5,
    multiplierText: '3.5x',
    colorHex: '#ef4444', // Red
    colorThreeHex: 0xef4444,
    description: {
      en: 'Critical Congestion — Severe bottleneck (multiplier: 3.5x detour penalty)',
      te: 'తీవ్ర రద్దీ — తీవ్రమైన ప్రతిష్టంభన (గుణకం: 3.5x డైవర్షన్)',
      hi: 'गंभीर भीड़ — अत्यधिक अवरोध (गुणक: 3.5x वैकल्पिक मोड़)',
    },
  },
};

/**
 * Returns populated CrowdDensityZone array for a given preset.
 */
export function getCrowdDensityZones(preset: CrowdSimulationPreset): CrowdDensityZone[] {
  const densityMap = PRESET_DENSITY_MAP[preset] || PRESET_DENSITY_MAP.normal_flow;

  return CROWD_ZONE_DEFINITIONS.map((def) => {
    const entry = densityMap[def.id] || { density: 'low' as CrowdZoneDensity, waitMin: 1 };
    const meta = CROWD_FACTOR_MAP[entry.density];

    return {
      id: def.id,
      nodeId: def.nodeId,
      name: def.name,
      coordinates: def.coordinates,
      densityLevel: entry.density,
      crowdFactor: meta.factor,
      colorHex: meta.colorHex,
      colorThreeHex: meta.colorThreeHex,
      estimatedWaitMinutes: entry.waitMin,
      description: meta.description,
    };
  });
}

/**
 * Returns a mapping of WalkwayNode ID -> Crowd Factor (c >= 0.0)
 * Non-destructive weight formula: W_eff = W_base * (1 + c)
 */
export function getCrowdNodeFactors(preset: CrowdSimulationPreset): Map<string, number> {
  const zones = getCrowdDensityZones(preset);
  const factorMap = new Map<string, number>();

  zones.forEach((zone) => {
    factorMap.set(zone.nodeId, zone.crowdFactor);
  });

  // Announcement mast is co-located at Pushkar Ghat corridor
  const pushkarFactor = Math.max(
    factorMap.get('node-promenade-pushkar-center') ?? 0,
    factorMap.get('node-promenade-pushkar-north') ?? 0
  );
  if (pushkarFactor > 0) {
    factorMap.set('node-promenade-announcements', pushkarFactor);
  }

  return factorMap;
}

// In-memory subscription mechanism for reactive UI and map updates
type CrowdListener = (preset: CrowdSimulationPreset, zones: CrowdDensityZone[]) => void;
const listeners = new Set<CrowdListener>();
let currentPreset: CrowdSimulationPreset = 'peak_snanam_rush';

export function getCurrentSimulationPreset(): CrowdSimulationPreset {
  return currentPreset;
}

export function setSimulationPreset(newPreset: CrowdSimulationPreset) {
  currentPreset = newPreset;
  const zones = getCrowdDensityZones(newPreset);
  listeners.forEach((listener) => {
    try {
      listener(newPreset, zones);
    } catch (err) {
      console.error('Error in crowd listener callback:', err);
    }
  });
}

export function subscribeToCrowdUpdates(callback: CrowdListener): () => void {
  listeners.add(callback);
  // Send current state immediately
  callback(currentPreset, getCrowdDensityZones(currentPreset));
  return () => {
    listeners.delete(callback);
  };
}
