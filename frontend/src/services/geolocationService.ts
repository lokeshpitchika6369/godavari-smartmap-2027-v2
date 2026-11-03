import { UserLocation, GeolocationStatus } from '../types';
import { calculateHaversineDistanceMeters } from './routingService';

// Event Perimeter Geofence (2,500 meters from festival center)
export const EVENT_GEOFENCE_RADIUS_METERS = 2500;
export const EVENT_CENTER_COORDINATES: [number, number] = [17.0015, 81.7795]; // [lat, lng] near Pushkar Ghat

/**
 * Standard default entry origin when device GPS is outside the festival grounds.
 * Automatically set to Central Main Gate 02 (Pushkar Arch).
 */
export const DEFAULT_EVENT_ORIGIN: UserLocation = {
  lat: 17.0018,
  lng: 81.7812,
  accuracy: 10,
  heading: null,
  speed: null,
  timestamp: Date.now(),
  source: 'manual_selection',
  label: 'Central Main Gate 02 (Pushkar Arch)',
};

/**
 * Checks whether given coordinates reside within the 2,500m event perimeter.
 */
export function isWithinEventGeofence(coord: [number, number]): boolean {
  const dist = calculateHaversineDistanceMeters(coord, EVENT_CENTER_COORDINATES);
  return dist <= EVENT_GEOFENCE_RADIUS_METERS;
}

/**
 * Returns distance from event center in meters.
 */
export function getDistanceFromEventCenterMeters(coord: [number, number]): number {
  return calculateHaversineDistanceMeters(coord, EVENT_CENTER_COORDINATES);
}

export interface ManualLandmark {
  id: string;
  name: { en: string; te: string; hi: string };
  category: string;
  coordinates: [number, number]; // [lat, lng]
}

export const MANUAL_START_LANDMARKS: ManualLandmark[] = [
  {
    id: 'start-gate-central',
    name: {
      en: 'Central Main Gate 02 (Pushkar Arch)',
      te: 'కేంద్ర ప్రధాన ద్వారం 02 (పుష్కర్ ఆర్చ్)',
      hi: 'केंद्रीय मुख्य द्वार 02 (पुष्कर मेहराब)',
    },
    category: 'gates',
    coordinates: [17.00180, 81.78119],
  },
  {
    id: 'start-gate-north',
    name: {
      en: 'North Entry Gate 01 (Kotilingala)',
      te: 'ఉత్తర ప్రవేశ ద్వారం 01 (కోటిలింగాల)',
      hi: 'उत्तर प्रवेश द्वार 01 (कोटिशिवलिंग)',
    },
    category: 'gates',
    coordinates: [17.00961, 81.77799],
  },
  {
    id: 'start-gate-south',
    name: {
      en: 'South Entry Gate 03 (Saraswati)',
      te: 'దక్షిణ ప్రవేశ ద్వారం 03 (సరస్వతి)',
      hi: 'दक्षिण प्रवेश द्वार 03 (सरस्वती)',
    },
    category: 'gates',
    coordinates: [16.99384, 81.78703],
  },
  {
    id: 'start-bus-north',
    name: {
      en: 'Special Shuttle Terminal North',
      te: 'ప్రత్యేక షటిల్ బస్ టెర్మినల్ నార్త్',
      hi: 'विशेष शटल बस टर्मिनल उत्तर',
    },
    category: 'busStops',
    coordinates: [17.00943, 81.78345],
  },
  {
    id: 'start-parking-east',
    name: {
      en: 'Pilgrim Vehicle Parking Ground A',
      te: 'భక్తుల వాహన పార్కింగ్ గ్రౌండ్ A',
      hi: 'श्रद्धालु वाहन पार्किंग मैदान A',
    },
    category: 'parking',
    coordinates: [17.00465, 81.78778],
  },
  {
    id: 'start-ghat-pushkar',
    name: {
      en: 'Pushkar Ghat (Main Steps)',
      te: 'పుష్కర్ ఘాట్ (ప్రధాన మెట్లు)',
      hi: 'पुष्कर घाट (मुख्य सीढ़ियां)',
    },
    category: 'ghats',
    coordinates: [17.00150, 81.77875],
  },
  {
    id: 'start-parking-south-bus',
    name: {
      en: 'South Inter-District Bus Terminal',
      te: 'దక్షిణ అంతర్-జిల్లా బస్సు టెర్మినల్',
      hi: 'दक्षिण अंतर-जिला बस टर्मिनल',
    },
    category: 'parking',
    coordinates: [16.99591, 81.78844],
  },
  {
    id: 'start-gate-east-04',
    name: {
      en: 'East Arterial Vehicle Ingress Gate 04',
      te: 'తూర్పు ప్రధాన వాహన ప్రవేశ ద్వారం 04',
      hi: 'पूर्वी मुख्य वाहन प्रवेश द्वार 04',
    },
    category: 'gates',
    coordinates: [17.00285, 81.78938],
  },
  {
    id: 'start-gate-emergency-05',
    name: {
      en: 'Emergency Green Corridor Gate 05',
      te: 'అత్యవసర గ్రీన్ కారిడార్ ద్వారం 05',
      hi: 'आपातकालीन ग्रीन कॉरिडोर द्वार 05',
    },
    category: 'gates',
    coordinates: [17.00015, 81.78872],
  },
  {
    id: 'start-gate-north-06',
    name: {
      en: 'North Ghat Pilgrim Pedestrian Gate 06',
      te: 'ఉత్తర ఘాట్ యాత్రికుల పాదచారుల ద్వారం 06',
      hi: 'उत्तर घाट श्रद्धालु पैदल यात्री द्वार 06',
    },
    category: 'gates',
    coordinates: [17.01096, 81.77856],
  },
];

/**
 * Checks whether the environment meets the security requirements for the Geolocation API.
 * The browser Geolocation API requires a secure context (HTTPS) or localhost.
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

export function isSecureContextOrLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

/**
 * Requests the single current device location via browser Geolocation API.
 */
export function requestCurrentDevicePosition(): Promise<{
  location: UserLocation | null;
  status: GeolocationStatus;
  errorMessage?: string;
}> {
  return new Promise((resolve) => {
    if (!isGeolocationSupported()) {
      resolve({
        location: null,
        status: 'unsupported',
        errorMessage: 'Browser does not support Geolocation.',
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 10000,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
          source: 'live_gps',
          label: 'Live Device GPS',
        };
        resolve({ location: userLoc, status: 'active' });
      },
      (err) => {
        let status: GeolocationStatus = 'unavailable';
        let errorMessage = err.message;
        if (err.code === err.PERMISSION_DENIED) {
          status = 'denied';
          errorMessage = 'Location access permission was denied by the user.';
        } else if (err.code === err.TIMEOUT) {
          status = 'timeout';
          errorMessage = 'Location acquisition timed out.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          status = 'unavailable';
          errorMessage = 'Location information is unavailable on this device.';
        }
        resolve({ location: null, status, errorMessage });
      },
      options
    );
  });
}

/**
 * Watches continuous device position updates as the visitor walks.
 */
export function watchDevicePosition(
  onUpdate: (location: UserLocation) => void,
  onError: (status: GeolocationStatus, message: string) => void
): number | null {
  if (!isGeolocationSupported()) {
    onError('unsupported', 'Geolocation unsupported');
    return null;
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000,
  };

  return navigator.geolocation.watchPosition(
    (pos) => {
      const userLoc: UserLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
        source: 'live_gps',
        label: 'Live Device GPS',
      };
      onUpdate(userLoc);
    },
    (err) => {
      let status: GeolocationStatus = 'unavailable';
      if (err.code === err.PERMISSION_DENIED) status = 'denied';
      else if (err.code === err.TIMEOUT) status = 'timeout';
      onError(status, err.message);
    },
    options
  );
}

/**
 * Clears an active geolocation watch.
 */
export function clearDevicePositionWatch(watchId: number): void {
  if (isGeolocationSupported() && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Creates a valid UserLocation object for a manual starting landmark.
 */
export function createManualStartingLocation(landmark: ManualLandmark): UserLocation {
  return {
    lat: landmark.coordinates[0],
    lng: landmark.coordinates[1],
    accuracy: 10, // Landmark precise reference
    timestamp: Date.now(),
    source: 'manual_selection',
    label: landmark.name.en,
  };
}
