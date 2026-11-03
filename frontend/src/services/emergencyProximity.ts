import { Facility, NearestAidResult, EmergencyProximityDetection } from '../types';
import { calculateHaversineDistanceMeters } from './routingService';

/**
 * Standard walking speed for pilgrims along pedestrian corridors (meters per second)
 * 1.15 m/s ≈ 4.14 km/h ≈ 69 meters per minute.
 */
export const NOMINAL_WALKING_SPEED_MPS = 1.15;

export const EMERGENCY_WALK_DISCLAIMER =
  'Estimated unimpeded walking time (geometric calculation at 1.15 m/s) — Not an official emergency responder dispatch guarantee.';

export interface RiverfrontLandmarkReference {
  id: string;
  name: { en: string; te: string; hi: string };
  coordinates: [number, number]; // [lat, lng]
}

export const KNOWN_RIVERFRONT_LANDMARKS: RiverfrontLandmarkReference[] = [
  {
    id: 'pushkar-ghat-central',
    name: {
      en: 'Pushkar Ghat Central Pavilion',
      te: 'పుష్కర్ ఘాట్ ప్రధాన కేంద్ర మండపం',
      hi: 'पुष्कर घाट मुख्य केंद्रीय मंडप',
    },
    coordinates: [17.00150, 81.77875],
  },
  {
    id: 'kotilingala-ghat-north',
    name: {
      en: 'Kotilingala Ghat 01 (North)',
      te: 'కోటిలింగాల ఘాట్ 01 (ఉత్తరం)',
      hi: 'कोटिशिवलिंग घाट 01 (उत्तर)',
    },
    coordinates: [17.00691, 81.77555],
  },
  {
    id: 'saraswati-ghat-south',
    name: {
      en: 'Saraswati Ghat 03 (South)',
      te: 'సరస్వతి ఘాట్ 03 (దక్షిణం)',
      hi: 'सरस्वती घाट 03 (दक्षिण)',
    },
    coordinates: [16.99564, 81.78326],
  },
  {
    id: 'gate-north-01',
    name: {
      en: 'North Entry Gate 01',
      te: 'ఉత్తర ప్రవేశ ద్వారం 01',
      hi: 'उत्तर प्रवेश द्वार 01',
    },
    coordinates: [17.00961, 81.77799],
  },
  {
    id: 'gate-central-02',
    name: {
      en: 'Central Main Gate 02 (Pushkar Arch)',
      te: 'కేంద్ర ప్రధాన ద్వారం 02 (పుష్కర్ ఆర్చ్)',
      hi: 'केंद्रीय मुख्य द्वार 02 (पुष्कर मेहराब)',
    },
    coordinates: [17.00180, 81.78119],
  },
  {
    id: 'temple-markandeya',
    name: {
      en: 'Sri Markandeya Swamy Temple',
      te: 'శ్రీ మార్కండేయ స్వామి దేవాలయం',
      hi: 'श्री मार्कंडेय स्वामी मंदिर',
    },
    coordinates: [17.00384, 81.77894],
  },
];

/**
 * Calculates estimated walking minutes given distance in meters.
 * Assumes unimpeded pedestrian velocity of 1.15 m/s (69 meters / minute).
 */
export function calculateEstimatedWalkMinutes(distanceMeters: number): number {
  if (distanceMeters <= 0) return 0;
  return Math.max(1, Math.round(distanceMeters / (NOMINAL_WALKING_SPEED_MPS * 60)));
}

/**
 * Checks if a facility is a medical clinic / first aid post.
 */
export function isMedicalFacility(facility: Facility): boolean {
  const cat = (facility.category || '').toLowerCase();
  const model = (facility.modelType || '').toLowerCase();
  const id = facility.id.toLowerCase();
  return (
    cat === 'medical' ||
    model === 'medical' ||
    id.includes('med-') ||
    id.includes('first-aid') ||
    id.includes('clinic')
  );
}

/**
 * Checks if a facility is a police helpdesk / security control booth.
 */
export function isPoliceHelpdeskFacility(facility: Facility): boolean {
  const cat = (facility.category || '').toLowerCase();
  const nameEn = (facility.name.en || '').toLowerCase();
  const id = facility.id.toLowerCase();
  return (
    cat === 'helpcentres' ||
    nameEn.includes('police') ||
    nameEn.includes('help & missing') ||
    nameEn.includes('control') ||
    nameEn.includes('command') ||
    id.includes('police') ||
    id.includes('help-centre')
  );
}

/**
 * Resolves the nearest single facility matching a predicate relative to origin coordinates.
 */
export function findNearestFacilityByPredicate(
  originCoords: [number, number],
  facilities: Facility[],
  predicate: (facility: Facility) => boolean,
  categoryType: 'medical' | 'police'
): NearestAidResult | null {
  const candidates = facilities.filter(predicate);
  if (candidates.length === 0) return null;

  let nearest: Facility | null = null;
  let minDistance = Infinity;

  for (const fac of candidates) {
    const dist = calculateHaversineDistanceMeters(originCoords, fac.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = fac;
    }
  }

  if (!nearest) return null;

  return {
    facility: nearest,
    distanceMeters: minDistance,
    estimatedWalkMinutes: calculateEstimatedWalkMinutes(minDistance),
    category: categoryType,
    disclaimer: EMERGENCY_WALK_DISCLAIMER,
  };
}

/**
 * Primary resolver for nearest Medical Clinic and Police Helpdesk.
 */
export function detectNearestEmergencyAid(
  originCoords: [number, number],
  facilities: Facility[],
  locationSource: 'live_gps' | 'manual_landmark' | 'default_center' = 'live_gps',
  referenceLandmarkLabel?: string
): EmergencyProximityDetection {
  const nearestMedical = findNearestFacilityByPredicate(
    originCoords,
    facilities,
    isMedicalFacility,
    'medical'
  );

  const nearestPolice = findNearestFacilityByPredicate(
    originCoords,
    facilities,
    isPoliceHelpdeskFacility,
    'police'
  );

  return {
    nearestMedical,
    nearestPolice,
    sourceCoordinates: originCoords,
    locationSource,
    referenceLandmarkLabel,
  };
}

/**
 * Dispatches an emergency alert event across the application.
 * CRITICAL REQUIREMENT (Phase 4.1 -> 4.4):
 * Immediately cancels active speech synthesis audio so the device audio channel
 * is unblocked for emergency phone calls and sirens.
 */
export function dispatchEmergencyAlertEvent(metadata: Record<string, any> = {}): void {
  if (typeof window !== 'undefined') {
    // 1. Immediately mute any browser speech synthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('[EmergencyProximity] Speech synthesis cancel error:', err);
      }
    }

    // 2. Dispatch custom DOM event
    try {
      const event = new CustomEvent('pushkaralu:emergency-alert', {
        detail: {
          timestamp: Date.now(),
          source: 'sos_trigger',
          ...metadata,
        },
      });
      window.dispatchEvent(event);
      console.log('[EmergencyProximity] Dispatched pushkaralu:emergency-alert event. Audio muted.');
    } catch (err) {
      console.error('[EmergencyProximity] Failed to dispatch emergency event:', err);
    }
  }
}

/**
 * Subscribes to emergency alert events (for audio player muting, HUD banners, etc.)
 */
export function subscribeEmergencyAlert(callback: (event: CustomEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const listener = (e: Event) => {
    callback(e as CustomEvent);
  };

  window.addEventListener('pushkaralu:emergency-alert', listener);
  return () => {
    window.removeEventListener('pushkaralu:emergency-alert', listener);
  };
}
