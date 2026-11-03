import QRCode from 'qrcode';
import { Facility, Language } from '../types';
import { FACILITIES_DATA } from '../data/facilitiesData';

/**
 * Returns the base web application URL.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5173';
}

/**
 * Builds an official deep link URL for a specific facility or stall.
 */
export function buildFacilityDeepLink(facilityId: string): string {
  const base = getAppBaseUrl();
  return `${base}/?facility=${encodeURIComponent(facilityId)}`;
}

/**
 * Validates whether an incoming QR code facility reference exists in the active registry.
 */
export function validateQrFacilityId(facilityId: string): boolean {
  if (!facilityId) return false;
  return FACILITIES_DATA.some(
    (f) =>
      f.id.toLowerCase() === facilityId.toLowerCase() ||
      (f.qrCodeId && f.qrCodeId.toLowerCase() === facilityId.toLowerCase())
  );
}

/**
 * Finds a facility by either its unique `id` or its `qrCodeId`.
 */
export function findFacilityByQrRef(ref: string): Facility | undefined {
  if (!ref) return undefined;
  const clean = ref.trim().toLowerCase();
  return FACILITIES_DATA.find(
    (f) => f.id.toLowerCase() === clean || (f.qrCodeId && f.qrCodeId.toLowerCase() === clean)
  );
}

/**
 * Generates a PNG Data URL representing the facility's QR code.
 */
export async function generateFacilityQrDataUrl(facility: Facility): Promise<string> {
  const deepLink = buildFacilityDeepLink(facility.id);
  try {
    const dataUrl = await QRCode.toDataURL(deepLink, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    throw err;
  }
}

/**
 * Generates an SVG string representing the facility's QR code.
 */
export async function generateFacilityQrSvg(facility: Facility): Promise<string> {
  const deepLink = buildFacilityDeepLink(facility.id);
  return QRCode.toString(deepLink, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Generates a printable official government event signage sheet for physical placement.
 */
export function openPrintableSignageWindow(
  facility: Facility,
  qrDataUrl: string,
  _lang: Language = 'en'
): void {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Official Signage — ${facility.name.en}</title>
      <style>
        @page { size: A4 portrait; margin: 20mm; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          text-align: center;
        }
        .signage-border {
          border: 4px solid #1e3a8a;
          border-radius: 12px;
          padding: 32px 24px;
          box-sizing: border-box;
          max-width: 650px;
          margin: 0 auto;
        }
        .header-badge {
          background-color: #15803d;
          color: white;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.1em;
          padding: 6px 14px;
          border-radius: 9999px;
          display: inline-block;
          margin-bottom: 12px;
        }
        .gov-title {
          font-size: 20px;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          margin: 4px 0;
        }
        .event-title {
          font-size: 26px;
          font-weight: 900;
          color: #b45309;
          margin: 4px 0 16px 0;
        }
        .divider {
          height: 2px;
          background: #e2e8f0;
          margin: 16px 0;
        }
        .facility-name {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .facility-name-te {
          font-size: 20px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 16px;
        }
        .qr-wrapper {
          background: #ffffff;
          padding: 16px;
          display: inline-block;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          margin: 12px 0;
        }
        .qr-img {
          width: 260px;
          height: 260px;
          display: block;
        }
        .scan-instruction {
          font-size: 16px;
          font-weight: 700;
          color: #0369a1;
          margin-top: 12px;
        }
        .sub-instruction {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .qr-id-chip {
          background: #f1f5f9;
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
          margin-top: 12px;
          border: 1px solid #e2e8f0;
        }
        .footer-note {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 24px;
          border-top: 1px dashed #cbd5e1;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="signage-border">
        <div class="header-badge">GOVERNMENT OF ANDHRA PRADESH</div>
        <div class="gov-title">AP Innovation Challenge — PS-09</div>
        <div class="event-title">GODAVARI PUSHKARALU 2027</div>
        <div class="divider"></div>

        <div class="facility-name">${facility.name.en}</div>
        <div class="facility-name-te">${facility.name.te}</div>

        <div class="qr-wrapper">
          <img class="qr-img" src="${qrDataUrl}" alt="QR Code for ${facility.name.en}" />
        </div>

        <div class="scan-instruction">SCAN WITH ANY SMARTPHONE CAMERA</div>
        <div class="sub-instruction">Instant interactive 3D map location, stall details, and walking directions.</div>
        <div class="qr-id-chip">ID: ${facility.qrCodeId || facility.id}</div>

        <div class="footer-note">
          Official Digital Wayfinding System • GIS-Based Pushkaralu Infrastructure • Municipal Administration & Police Dept
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
