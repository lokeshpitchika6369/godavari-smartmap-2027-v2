import {
  CrowdReportPayload,
  CrowdDensitySummary,
  EmergencyReportPayload,
  EmergencyReportReceipt,
  MissingPersonPayload,
  MissingPersonReceipt,
  MissingPersonPublic,
  FoundPersonPayload,
  FoundPersonPublic,
} from '../types';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }

  // Prioritize Vite environment variable when defined at build or runtime
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    // Retain automatic port 8000 for local development and private LAN testing
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local')
    ) {
      return `http://${host}:8000/api/v1`;
    }
    // Production fallback: same-origin HTTPS URL
    return `${window.location.origin}/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    if (
      err instanceof TypeError ||
      (err && err.message && (err.message.includes('fetch') || err.message.includes('NetworkError')))
    ) {
      throw new Error(
        `Unable to reach Pushkaralu Central Server (${url}). Please ensure the backend service is running on port 8000 or check network connectivity.`
      );
    }
    throw err;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail
            .map((err: any) => {
              const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : '';
              const msg = err.msg || 'Invalid value';
              if (field === 'description' && (msg.includes('at least 10') || msg.includes('too_short'))) {
                return 'Physical description must have at least 10 characters';
              }
              if (field === 'appearance_description' && (msg.includes('at least 10') || msg.includes('too_short'))) {
                return 'Appearance description must have at least 10 characters';
              }
              if (field === 'contact_phone' || field === 'finder_contact_phone') {
                return 'Please provide a valid 10-digit Indian mobile number';
              }
              const fieldName = typeof field === 'string' ? field.replace(/_/g, ' ') : '';
              return fieldName ? `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${msg}` : msg;
            })
            .join('. ');
        } else {
          errorDetail = JSON.stringify(errJson.detail);
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

// --- CROWD REPORTING ---

export async function submitCrowdReport(payload: CrowdReportPayload): Promise<{ id: string; message: string }> {
  const res = await safeFetch(`${API_BASE_URL}/crowd/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getCrowdDensitySummary(): Promise<CrowdDensitySummary> {
  const res = await safeFetch(`${API_BASE_URL}/crowd/density-summary`);
  return handleResponse(res);
}

// --- EMERGENCY SERVICES ---

export async function submitEmergencyReport(payload: EmergencyReportPayload): Promise<EmergencyReportReceipt> {
  const res = await safeFetch(`${API_BASE_URL}/emergency/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getEmergencyContacts(): Promise<{
  official_disclaimer: string;
  state_hotlines: Array<{ service_name: string; phone_number: string; description: string; is_toll_free: boolean }>;
  on_site_helpdesks: Array<{ service_name: string; phone_number: string; description: string; is_toll_free: boolean }>;
}> {
  const res = await safeFetch(`${API_BASE_URL}/emergency/contacts`);
  return handleResponse(res);
}

export async function checkEmergencyStatus(trackingToken: string): Promise<any> {
  const res = await safeFetch(`${API_BASE_URL}/emergency/status/${encodeURIComponent(trackingToken)}`);
  return handleResponse(res);
}

// --- MISSING & FOUND PERSONS ---

export async function submitMissingPersonReport(payload: MissingPersonPayload): Promise<MissingPersonReceipt> {
  const res = await safeFetch(`${API_BASE_URL}/missing-persons/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getActiveMissingPersons(): Promise<MissingPersonPublic[]> {
  const res = await safeFetch(`${API_BASE_URL}/missing-persons/active`);
  return handleResponse(res);
}

export async function checkMissingPersonStatus(trackingToken: string): Promise<MissingPersonReceipt> {
  const res = await safeFetch(`${API_BASE_URL}/missing-persons/status/${encodeURIComponent(trackingToken)}`);
  return handleResponse(res);
}

export async function submitFoundPersonReport(payload: FoundPersonPayload): Promise<FoundPersonPublic> {
  const res = await safeFetch(`${API_BASE_URL}/found-persons/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function getActiveFoundPersons(): Promise<FoundPersonPublic[]> {
  const res = await safeFetch(`${API_BASE_URL}/found-persons/active`);
  return handleResponse(res);
}

// --- UNIVERSAL OFFLINE-CAPABLE SYNC API (FEATURE 3) ---

export async function syncIncident(
  incidentType: 'missing_person' | 'found_person' | 'emergency' | 'crowd',
  payload: Record<string, any>,
  idempotencyKey?: string
): Promise<{
  idempotency_key: string;
  incident_type: string;
  incident_id: string;
  tracking_token?: string;
  status: string;
  duplicate_suppressed: boolean;
  message: string;
  data: Record<string, any>;
}> {
  const key = idempotencyKey || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const res = await safeFetch(`${API_BASE_URL}/incidents/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idempotency_key: key,
      incident_type: incidentType,
      payload,
    }),
  });
  return handleResponse(res);
}

