export type Language = 'en' | 'te' | 'hi';

export type MainSection =
  | 'places'
  | 'report_missing'
  | 'found_missing'
  | 'report_emergency'
  | 'dos_donts';

export type VerificationStatus =
  | 'illustrative_sample'
  | 'historical_reference'
  | 'pending_verification'
  | 'officially_verified';

export interface Facility {
  id: string;
  name: Record<Language, string>;
  category: string;
  coordinates: [number, number]; // [lat, lng]
  verificationStatus: VerificationStatus;
  description: Record<Language, string>;
  operationalStatus?: 'operational' | 'closed' | 'crowded';
  modelType: string;
  qrCodeId?: string;
  isStall?: boolean;
}

// --- PHASE 4: GPS GEOLOCATION TYPES ---
export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number; // meters
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  source: 'live_gps' | 'manual_selection';
  label?: string;
}

// --- PHASE 4: NAVIGATION & ROUTING TYPES ---
export interface RouteStep {
  id: string;
  instruction: Record<Language, string>;
  distanceMeters: number;
  turnType: 'straight' | 'left' | 'right' | 'slight_left' | 'slight_right' | 'arrive';
  coordinates: [number, number]; // [lat, lng]
}

export interface NavigationRoute {
  id: string;
  origin: {
    coordinates: [number, number];
    label: string;
    source: 'live_gps' | 'manual_selection';
  };
  destination: Facility;
  totalDistanceMeters: number;
  estimatedWalkingMinutes: number;
  pathCoordinates: [number, number][]; // [[lat, lng], ...]
  steps: RouteStep[];
  dataSource: 'pedestrian_walkway_network' | 'approximate_corridor';
  isArrived: boolean;
  isCongestionAware?: boolean;
  congestionAvoided?: boolean;
  originalDistanceMeters?: number;
  effectiveCongestionWeight?: number;
}

// --- PHASE 4: QR CODE SYSTEM TYPES ---
export interface QRCodeData {
  id: string;
  title: Record<Language, string>;
  category: string;
  deepLinkUrl: string;
  targetFacilityId?: string;
  targetGateId?: string;
  qrType: 'facility' | 'stall' | 'entry_gate' | 'general_map';
}

// --- PHASE 5: CROWD REPORTING, EMERGENCY & MISSING PERSONS TYPES ---
export type CrowdCongestionLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface CrowdReportPayload {
  location_name: string;
  latitude: number;
  longitude: number;
  congestion_level: CrowdCongestionLevel;
  reported_wait_minutes?: number;
  comments?: string;
}

export interface CrowdDensityMetric {
  location_name: string;
  report_count: number;
  dominant_congestion_level: string;
  average_wait_minutes: number;
  latest_report_time: string;
}

export interface CrowdDensitySummary {
  total_active_reports: number;
  window_minutes: number;
  locations: CrowdDensityMetric[];
}

export type EmergencyType = 'medical' | 'stampede_risk' | 'fire' | 'drowning_risk' | 'child_distress' | 'other';
export type EmergencySeverity = 'critical' | 'high' | 'medium';

export interface EmergencyReportPayload {
  incident_type: EmergencyType;
  severity: EmergencySeverity;
  landmark: string;
  latitude?: number;
  longitude?: number;
  contact_phone: string;
  details: string;
}

export interface EmergencyReportReceipt {
  id: string;
  incident_type: string;
  severity: string;
  landmark: string;
  status: string;
  reported_at: string;
  tracking_token: string;
  advisory_notice: string;
  direct_hotlines: Record<string, string>;
}

// --- PHASE 4.1: EMERGENCY SOS & NEAREST AID TYPES ---
export interface NearestAidResult {
  facility: Facility;
  distanceMeters: number;
  estimatedWalkMinutes: number;
  category: 'medical' | 'police';
  disclaimer: string;
}

export interface EmergencyProximityDetection {
  nearestMedical: NearestAidResult | null;
  nearestPolice: NearestAidResult | null;
  sourceCoordinates: [number, number];
  locationSource: 'live_gps' | 'manual_landmark' | 'default_center';
  referenceLandmarkLabel?: string;
}

// --- PHASE 4.2: DYNAMIC CROWD HEATMAP & CONGESTION-AWARE ROUTING TYPES ---
export type CrowdZoneDensity = 'low' | 'medium' | 'high' | 'critical';

export interface CrowdDensityZone {
  id: string;
  nodeId: string;
  name: Record<Language, string>;
  coordinates: [number, number]; // [lat, lng]
  densityLevel: CrowdZoneDensity;
  crowdFactor: number; // 0.0 (low), 0.5 (medium), 1.2 (high), 2.5 (critical)
  colorHex: string; // '#10b981', '#f59e0b', '#f97316', '#ef4444'
  colorThreeHex: number; // 0x10b981, 0xf59e0b, 0xf97316, 0xef4444
  estimatedWaitMinutes: number;
  description: Record<Language, string>;
}

export interface CrowdHeatmapState {
  showOverlay: boolean;
  avoidCrowds: boolean;
  simulationPreset: 'peak_snanam_rush' | 'evening_aarti_rush' | 'normal_flow' | 'all_clear';
  disclaimer: string;
}

export interface MissingPersonPayload {
  person_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  description: string;
  last_seen_location: string;
  last_seen_time: string;
  clothing_details?: string;
  contact_phone: string;
  contact_name: string;
  relationship: string;
}

export interface MissingPersonReceipt {
  id: string;
  person_name: string;
  age: number;
  gender: string;
  description: string;
  last_seen_location: string;
  last_seen_time: string;
  clothing_details?: string;
  status: string;
  reported_at: string;
  tracking_token: string;
  message: string;
  notification_status?: string;
  notification_notice?: string;
}

export interface MissingPersonPublic {
  id: string;
  person_name: string;
  age: number;
  gender: string;
  description: string;
  last_seen_location: string;
  last_seen_time: string;
  clothing_details?: string;
  status: string;
  reported_at: string;
  contact_phone_masked: string;
  contact_name_masked: string;
  helpdesk_contact: string;
}

export interface FoundPersonPayload {
  approximate_age: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  appearance_description: string;
  current_safekeeping_location: string;
  finder_contact_phone: string;
  finder_name: string;
}

export interface FoundPersonPublic {
  id: string;
  approximate_age: string;
  gender: string;
  appearance_description: string;
  current_safekeeping_location: string;
  status: string;
  reported_at: string;
  finder_name_masked: string;
  action_notice: string;
  notification_status?: string;
  notification_notice?: string;
}

// --- PHASE 4.3 / FEATURE 3: OFFLINE OUTBOX & SYNC TYPES ---
export type OfflineIncidentType = 'missing_person' | 'found_person' | 'emergency' | 'crowd';

export type OutboxItemStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface OfflineIncidentOutboxItem {
  idempotency_key: string; // Immutable UUIDv4 generated upon initial creation
  incident_type: OfflineIncidentType;
  payload: Record<string, any>;
  created_at: number; // timestamp ms
  retry_count: number;
  last_attempt_at?: number;
  last_error?: string;
  status: OutboxItemStatus;
  server_response?: {
    incident_id: string;
    tracking_token?: string;
    duplicate_suppressed: boolean;
    data: Record<string, any>;
  };
}

export interface SyncApiResponse {
  idempotency_key: string;
  incident_type: string;
  incident_id: string;
  tracking_token?: string;
  status: string;
  duplicate_suppressed: boolean;
  message: string;
  data: Record<string, any>;
}

