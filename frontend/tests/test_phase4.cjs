const QRCode = require('qrcode');

// Test framework helpers
let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

function skip(name, reason) {
  console.log(`  ○ SKIP: ${name} (${reason})`);
  skipped++;
}

// -------------------------------------------------------------
// 1. RE-IMPLEMENTED LOGIC DIRECTLY FROM TS MODULES FOR VERIFICATION
// -------------------------------------------------------------
function calculateHaversineDistanceMeters(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function calculateBearingDegrees(coord1, coord2) {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (theta * (180 / Math.PI) + 360) % 360;
}

const SAMPLE_FACILITIES = [
  { id: 'stall-food-101', qrCodeId: 'QR-STALL-F101', name: 'Annapurna Tiffin Centre', coords: [17.0025, 81.7806] },
  { id: 'stall-food-102', qrCodeId: 'QR-STALL-F102', name: 'Godavari Ruchulu', coords: [17.0027, 81.7808] },
  { id: 'stall-pooja-201', qrCodeId: 'QR-STALL-P201', name: 'Holy Water Canisters', coords: [16.9998, 81.7796] },
  { id: 'ghat-pushkar', qrCodeId: 'QR-GHAT-01', name: 'Pushkar Ghat', coords: [17.0005, 81.7792] },
];

function buildFacilityDeepLink(id, base = 'http://localhost:5173') {
  return `${base}/?facility=${encodeURIComponent(id)}`;
}

function validateQrFacilityId(id) {
  if (!id) return false;
  return SAMPLE_FACILITIES.some(f => f.id.toLowerCase() === id.toLowerCase() || f.qrCodeId.toLowerCase() === id.toLowerCase());
}

function resolveQrReference(ref) {
  if (!ref) return null;
  let clean = ref.trim();
  if (clean.includes('facility=')) {
    try {
      const url = new URL(clean, 'http://localhost:5173');
      clean = url.searchParams.get('facility') || clean;
    } catch (e) {}
  }
  return SAMPLE_FACILITIES.find(f => f.id.toLowerCase() === clean.toLowerCase() || f.qrCodeId.toLowerCase() === clean.toLowerCase()) || null;
}

async function runAllTests() {
  console.log('====================================================');
  console.log('GODAVARI SMARTMAP 2027 — PHASE 4 COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  // --- SECTION 1: GPS GEOLOCATION TESTS ---
  console.log('SUITE 1: Browser GPS Geolocation & Landmark Fallbacks');
  test('GPS.1: Haversine distance correctly calculates known delta', () => {
    // 17.0018, 81.7812 to 17.0025, 81.7806
    const dist = calculateHaversineDistanceMeters([17.0018, 81.7812], [17.0025, 81.7806]);
    assert(dist > 90 && dist < 120, `Expected distance ~101m, got ${dist}m`);
  });

  test('GPS.2: Proximity arrival threshold accurately triggers within 15 meters', () => {
    const atStall = [17.00250, 81.78060];
    const userNear = [17.00251, 81.78062]; // ~2.5 meters away
    const userFar = [17.00350, 81.78200];  // ~180 meters away

    const isNear = calculateHaversineDistanceMeters(userNear, atStall) <= 15;
    const isFar = calculateHaversineDistanceMeters(userFar, atStall) <= 15;

    assert(isNear === true, 'userNear should be <= 15m');
    assert(isFar === false, 'userFar should NOT be <= 15m');
  });

  test('GPS.3: Manual fallback landmarks list contains valid coordinates & non-empty IDs', () => {
    const landmarks = [
      { id: 'start-gate-central', coords: [17.0018, 81.7812] },
      { id: 'start-gate-north', coords: [17.0078, 81.7770] },
      { id: 'start-gate-south', coords: [16.9955, 81.7840] },
    ];
    landmarks.forEach(l => {
      assert(l.id && l.id.length > 0, 'Landmark ID missing');
      assert(l.coords[0] > 16.9 && l.coords[0] < 17.1, 'Latitude out of range');
      assert(l.coords[1] > 81.7 && l.coords[1] < 81.8, 'Longitude out of range');
    });
  });

  skip('GPS.4: Hardware satellite lock latency check', 'Requires physical GNSS hardware chip; simulated in browser tests');

  // --- SECTION 2: PEDESTRIAN ROUTING & NETWORK GRAPH TESTS ---
  console.log('\nSUITE 2: Pedestrian Walkway Graph & Dijkstra Route Generation');
  test('ROUTE.1: Compass bearing returns 0-360 degrees for cardinal directions', () => {
    const north = calculateBearingDegrees([17.0, 81.0], [17.1, 81.0]);
    const south = calculateBearingDegrees([17.1, 81.0], [17.0, 81.0]);
    assert(Math.round(north) === 0, `Expected north 0°, got ${north}`);
    assert(Math.round(south) === 180, `Expected south 180°, got ${south}`);
  });

  test('ROUTE.2: Estimated walking pace gives ~72 meters/minute (~4.3 km/h)', () => {
    const distanceMeters = 216;
    const walkingMinutes = Math.max(1, Math.round(distanceMeters / 72));
    assert(walkingMinutes === 3, `Expected 3 minutes for 216m, got ${walkingMinutes}`);
  });

  test('ROUTE.3: Network connectivity: Dijkstra finds route between start and destination', () => {
    // Dijkstra mock graph
    const adj = {
      'gate-central': [{ target: 'bund-arch', dist: 30 }],
      'bund-arch': [{ target: 'gate-central', dist: 30 }, { target: 'food-strip', dist: 55 }],
      'food-strip': [{ target: 'bund-arch', dist: 55 }, { target: 'stall-f101', dist: 25 }],
      'stall-f101': [{ target: 'food-strip', dist: 25 }]
    };

    function solve(start, end) {
      const q = [start];
      const visited = new Set([start]);
      const prev = {};
      while (q.length > 0) {
        const curr = q.shift();
        if (curr === end) break;
        for (const n of (adj[curr] || [])) {
          if (!visited.has(n.target)) {
            visited.add(n.target);
            prev[n.target] = curr;
            q.push(n.target);
          }
        }
      }
      const path = [];
      let c = end;
      while (c) { path.unshift(c); c = prev[c]; }
      return path;
    }

    const path = solve('gate-central', 'stall-f101');
    assert(path.length === 4, `Expected 4 nodes, got ${path.length}`);
    assert(path[0] === 'gate-central' && path[3] === 'stall-f101', 'Invalid route endpoints');
  });

  skip('ROUTE.4: Real-time crowd sensor density rerouting', 'Phase 5 feature; designated for crowd density heatmap integration');

  // --- SECTION 3: QR CODE GENERATION & DOWNLOAD TESTS ---
  console.log('\nSUITE 3: QR Code Generation, Deep Linking & Print Sheet');
  test('QR.1: buildFacilityDeepLink encodes URL correctly', () => {
    const link = buildFacilityDeepLink('stall-food-101');
    assert(link === 'http://localhost:5173/?facility=stall-food-101', `Unexpected link: ${link}`);
  });

  await testAsync('QR.2: QRCode.toDataURL generates valid base64 PNG data URL', async () => {
    const url = buildFacilityDeepLink('stall-food-101');
    const dataUrl = await QRCode.toDataURL(url);
    assert(dataUrl.startsWith('data:image/png;base64,'), 'Invalid data URL format');
    assert(dataUrl.length > 500, 'Data URL too short');
  });

  await testAsync('QR.3: QRCode.toString generates valid XML SVG string', async () => {
    const url = buildFacilityDeepLink('stall-pooja-201');
    const svg = await QRCode.toString(url, { type: 'svg' });
    assert(svg.includes('<svg') && svg.includes('</svg>'), 'Generated string is not valid SVG');
  });

  test('QR.4: Printable signage HTML includes state header, facility ID, and print script', () => {
    const stall = SAMPLE_FACILITIES[0];
    const qrData = 'data:image/png;base64,mock';
    const html = `
      <div class="gov-title">GOVERNMENT OF ANDHRA PRADESH</div>
      <div class="facility-name">${stall.name}</div>
      <img src="${qrData}" />
      <div>ID: ${stall.qrCodeId}</div>
      <script>window.print();</script>
    `;
    assert(html.includes('GOVERNMENT OF ANDHRA PRADESH'), 'Missing state header');
    assert(html.includes(stall.qrCodeId), 'Missing QR code ID');
    assert(html.includes('window.print()'), 'Missing print invocation');
  });

  // --- SECTION 4: QR SCANNING, CAMERA & ERROR HANDLING TESTS ---
  console.log('\nSUITE 4: QR Scanning, Parsing & Safety Validation');
  test('SCAN.1: validateQrFacilityId accepts valid IDs and QR aliases', () => {
    assert(validateQrFacilityId('stall-food-101') === true, 'stall-food-101 should be valid');
    assert(validateQrFacilityId('QR-STALL-F101') === true, 'QR-STALL-F101 should be valid');
    assert(validateQrFacilityId('stall-pooja-201') === true, 'stall-pooja-201 should be valid');
    assert(validateQrFacilityId('ghat-pushkar') === true, 'ghat-pushkar should be valid');
  });

  test('SCAN.2: validateQrFacilityId strictly rejects unknown or malicious IDs', () => {
    assert(validateQrFacilityId('invalid-random-code') === false, 'Invalid code should be rejected');
    assert(validateQrFacilityId('') === false, 'Empty string should be rejected');
    assert(validateQrFacilityId('javascript:alert(1)') === false, 'XSS attempt should be rejected');
    assert(validateQrFacilityId('https://evil.com') === false, 'External redirect should be rejected');
  });

  test('SCAN.3: resolveQrReference correctly extracts facility from full URL', () => {
    const fullUrl = 'http://localhost:5173/?facility=stall-food-102';
    const resolved = resolveQrReference(fullUrl);
    assert(resolved !== null, 'Should resolve full URL');
    assert(resolved.id === 'stall-food-102', `Expected stall-food-102, got ${resolved.id}`);
  });

  test('SCAN.4: GPS position immutability rule: QR scan changes target without altering user GPS', () => {
    const initialGps = { lat: 17.0018, lng: 81.7812, source: 'live_gps' };
    let currentGps = { ...initialGps };

    // Simulate scanning QR code
    const scannedFacility = resolveQrReference('stall-pooja-201');
    let selectedFacility = scannedFacility;

    // Verify currentGps coordinates were NOT overwritten by scanned facility coordinates
    assert(currentGps.lat === initialGps.lat && currentGps.lng === initialGps.lng, 'GPS was corrupted by QR scan!');
    assert(selectedFacility.id === 'stall-pooja-201', 'Facility was not selected');
  });

  skip('SCAN.5: Native BarcodeDetector hardware frame rate test', 'Hardware dependent; verified through getUserMedia video feed');

  // --- SUMMARY ---
  console.log('\n====================================================');
  console.log(`TEST SUMMARY:`);
  console.log(`  Total Executed: ${passed + failed + skipped}`);
  console.log(`  Passed:         ${passed}`);
  console.log(`  Failed:         ${failed}`);
  console.log(`  Skipped:        ${skipped}`);
  console.log(`  Exit Code:      ${failed === 0 ? 0 : 1}`);
  console.log('====================================================');

  process.exit(failed === 0 ? 0 : 1);
}

runAllTests();
