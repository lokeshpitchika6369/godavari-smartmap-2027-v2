import {
  OfflineIncidentType,
  OfflineIncidentOutboxItem,
  SyncApiResponse,
} from '../types';

const OUTBOX_STORAGE_KEY = 'godavari_smartmap_incident_outbox_v2';
const MAX_AUTO_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 2000;
const MAX_RETRY_DELAY_MS = 60000;

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

/**
 * Generates an immutable RFC4122 v4 UUID for idempotency.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves the full incident outbox from local persistence.
 */
export function getOutbox(): OfflineIncidentOutboxItem[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[OfflineOutbox] Failed to read from localStorage:', err);
    return [];
  }
}

/**
 * Persists the outbox array to local persistence.
 */
function saveOutbox(items: OfflineIncidentOutboxItem[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('[OfflineOutbox] Failed to save to localStorage:', err);
  }
}

/**
 * Enqueues a new incident into the outbox with an immutable idempotency key.
 */
export function enqueueIncident(
  incidentType: OfflineIncidentType,
  payload: Record<string, any>
): OfflineIncidentOutboxItem {
  const idempotencyKey = generateUUID();
  const newItem: OfflineIncidentOutboxItem = {
    idempotency_key: idempotencyKey,
    incident_type: incidentType,
    payload,
    created_at: Date.now(),
    retry_count: 0,
    status: 'pending',
  };

  const outbox = getOutbox();
  outbox.push(newItem);
  saveOutbox(outbox);
  console.info(`[OfflineOutbox] Enqueued ${incidentType} with key: ${idempotencyKey}`);
  return newItem;
}

/**
 * Updates an existing outbox item by its immutable idempotency key.
 */
export function updateOutboxItem(
  idempotencyKey: string,
  updates: Partial<OfflineIncidentOutboxItem>
): void {
  const outbox = getOutbox();
  const index = outbox.findIndex((i) => i.idempotency_key === idempotencyKey);
  if (index !== -1) {
    outbox[index] = { ...outbox[index], ...updates };
    saveOutbox(outbox);
  }
}

/**
 * Removes an item from the outbox (e.g. after confirmation or manual deletion).
 */
export function removeOutboxItem(idempotencyKey: string): void {
  const outbox = getOutbox();
  const filtered = outbox.filter((i) => i.idempotency_key !== idempotencyKey);
  saveOutbox(filtered);
}

/**
 * Removes all successfully synced items from local storage.
 */
export function clearSyncedOutboxItems(): void {
  const outbox = getOutbox();
  const remaining = outbox.filter((i) => i.status !== 'synced');
  saveOutbox(remaining);
}

/**
 * Calculates exponential backoff delay based on retry attempt count.
 */
export function calculateBackoffDelay(retryCount: number): number {
  if (retryCount <= 0) return 0;
  const exp = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * Math.pow(2, retryCount - 1));
  const jitter = Math.floor(Math.random() * 500); // 0-500ms jitter
  return exp + jitter;
}

/**
 * Synchronizes a single item with the backend /incidents/sync endpoint.
 * Preserves the original idempotency key across all retries.
 */
export async function syncOutboxItem(item: OfflineIncidentOutboxItem): Promise<SyncApiResponse> {
  const baseUrl = getApiBaseUrl();
  updateOutboxItem(item.idempotency_key, {
    status: 'syncing',
    last_attempt_at: Date.now(),
  });

  try {
    const response = await fetch(`${baseUrl}/incidents/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: item.idempotency_key,
        incident_type: item.incident_type,
        payload: item.payload,
      }),
    });

    // Both HTTP 201 (fresh) and HTTP 200 (duplicate suppressed retry) indicate success
    if (response.status === 201 || response.status === 200) {
      const data: SyncApiResponse = await response.json();
      updateOutboxItem(item.idempotency_key, {
        status: 'synced',
        last_error: undefined,
        server_response: {
          incident_id: data.incident_id,
          tracking_token: data.tracking_token,
          duplicate_suppressed: data.duplicate_suppressed,
          data: data.data,
        },
      });
      console.info(`[OfflineOutbox] Successfully synced ${item.idempotency_key} -> ${data.incident_id} (suppressed: ${data.duplicate_suppressed})`);
      return data;
    }

    if (response.status === 409) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.detail || 'Idempotency key payload mismatch conflict';
      updateOutboxItem(item.idempotency_key, {
        status: 'failed',
        last_error: `HTTP 409: ${msg}`,
      });
      throw new Error(`Conflict: ${msg}`);
    }

    if (response.status === 422) {
      const errJson = await response.json().catch(() => ({}));
      const msg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      updateOutboxItem(item.idempotency_key, {
        status: 'failed',
        last_error: `Validation error: ${msg}`,
      });
      throw new Error(`Validation failed: ${msg}`);
    }

    // Server or network error (e.g. 500, 502, 503)
    const errText = await response.text().catch(() => 'Unknown server error');
    throw new Error(`HTTP ${response.status}: ${errText}`);
  } catch (error: any) {
    const nextRetry = item.retry_count + 1;
    const isExhausted = nextRetry >= MAX_AUTO_RETRIES;
    const errorMsg = error.message || 'Network request failed';

    updateOutboxItem(item.idempotency_key, {
      retry_count: nextRetry,
      status: isExhausted ? 'failed' : 'pending',
      last_error: errorMsg,
    });
    console.warn(`[OfflineOutbox] Sync failed for ${item.idempotency_key} (attempt ${nextRetry}/${MAX_AUTO_RETRIES}): ${errorMsg}`);
    throw error;
  }
}

/**
 * Flushes all eligible pending or failed items from the outbox.
 * @param forceManual If true, retries items even if retry count reached 5.
 */
export async function flushOutbox(forceManual: boolean = false): Promise<{
  synced: number;
  failed: number;
  pending: number;
}> {
  const outbox = getOutbox();
  let synced = 0;
  let failed = 0;
  let pending = 0;

  const eligibleItems = outbox.filter((item) => {
    if (item.status === 'synced') return false;
    if (forceManual) return true; // user explicitly triggered retry
    if (item.status === 'failed') return false; // wait for manual user intervention
    // Check backoff delay
    if (item.last_attempt_at) {
      const delay = calculateBackoffDelay(item.retry_count);
      if (Date.now() - item.last_attempt_at < delay) {
        return false;
      }
    }
    return true;
  });

  for (const item of eligibleItems) {
    try {
      await syncOutboxItem(item);
      synced++;
    } catch {
      failed++;
    }
  }

  const finalOutbox = getOutbox();
  pending = finalOutbox.filter((i) => i.status === 'pending').length;

  return { synced, failed, pending };
}

/**
 * Manually retries a specific failed item, retaining its original idempotency key.
 */
export async function retryOutboxItem(idempotencyKey: string): Promise<SyncApiResponse> {
  const outbox = getOutbox();
  const item = outbox.find((i) => i.idempotency_key === idempotencyKey);
  if (!item) {
    throw new Error(`Item ${idempotencyKey} not found in offline outbox`);
  }

  // Reset retry count but strictly retain the original idempotency_key
  updateOutboxItem(idempotencyKey, {
    retry_count: 0,
    status: 'pending',
    last_error: undefined,
  });

  return syncOutboxItem({
    ...item,
    retry_count: 0,
    status: 'pending',
  });
}

/**
 * Registers browser online event listeners to flush outbox upon network recovery.
 */
export function initOfflineSyncListeners(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    console.info('[OfflineOutbox] Network restored: initiating automatic outbox flush...');
    flushOutbox(false).catch((err) => {
      console.warn('[OfflineOutbox] Auto-flush after reconnect had errors:', err);
    });
  };

  window.addEventListener('online', handleOnline);

  // Return unsubscribe cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
