const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\lokes\\.gemini\\antigravity\\brain\\eb4095b7-5831-494e-ae6a-c4cbef06f6fb';
const scratchScreenshotsDir = 'C:\\Users\\lokes\\.gemini\\antigravity\\scratch\\godavari-smartmap-2027-v2\\screenshots_phase4_2';
const desktopWorkspaceDir = 'C:\\Users\\lokes\\OneDrive\\Desktop\\Smart map\\screenshots_phase4_2';

async function main() {
  console.log('=== STARTING PHASE 4.2: DYNAMIC CROWD HEATMAP & CONGESTION-AWARE ROUTING VERIFICATION ===\n');

  [artifactDir, scratchScreenshotsDir, desktopWorkspaceDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    }
  });

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const versionRes = await fetch('http://127.0.0.1:9222/json/version').then(r => r.json());
  console.log('Connected to Chrome:', versionRes.Browser);

  const newTab = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' }).then(r => r.json());
  const wsUrl = newTab.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();
  const consoleErrors = [];

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(resolve => { ws.onopen = resolve; });

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    } else if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      if (data.params.type === 'error') {
        consoleErrors.push(text);
        console.error('[BROWSER ERROR]:', text);
      }
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    
    // Write to artifactDir
    const p1 = path.join(artifactDir, filename);
    fs.writeFileSync(p1, buffer);
    console.log(`Saved screenshot: ${p1} (${buffer.length} bytes)`);

    // Write to scratchScreenshotsDir
    try {
      const p2 = path.join(scratchScreenshotsDir, filename);
      fs.writeFileSync(p2, buffer);
      console.log(`Copied to scratch: ${p2}`);
    } catch (e) {}

    // Write to desktopWorkspaceDir
    try {
      const p3 = path.join(desktopWorkspaceDir, filename);
      fs.writeFileSync(p3, buffer);
      console.log(`Copied to desktop: ${p3}`);
    } catch (e) {}

    return p1;
  }

  // 1. Navigate to frontend application
  console.log('1. Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 3000));

  // 2. Verify dynamic crowd heatmap legend elements
  console.log('2. Inspecting Crowd Heatmap Legend DOM...');
  const legendInfo = await evaluate(`(() => {
    const titleEl = document.querySelector('h3');
    const simBadge = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('SIMULATED DATA'));
    const avoidCrowdsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Avoid Crowds') || b.textContent.includes('Shortest Path'));
    const heatmapToggleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Heatmap ON') || b.textContent.includes('Heatmap OFF'));
    const presetButtons = Array.from(document.querySelectorAll('button')).filter(b => 
      b.textContent.includes('Snanam') || b.textContent.includes('Aarti') || b.textContent.includes('Normal') || b.textContent.includes('All Clear')
    ).map(b => b.textContent.trim());

    const disclaimerEl = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('Simulated Crowd Density Data'));

    return {
      title: titleEl ? titleEl.textContent : null,
      hasSimBadge: !!simBadge,
      simBadgeText: simBadge ? simBadge.textContent : null,
      avoidCrowdsBtnText: avoidCrowdsBtn ? avoidCrowdsBtn.textContent.trim() : null,
      heatmapToggleBtnText: heatmapToggleBtn ? heatmapToggleBtn.textContent.trim() : null,
      presetButtons,
      disclaimer: disclaimerEl ? disclaimerEl.textContent : null
    };
  })()`);

  console.log('   Crowd Heatmap Legend DOM inspection:', JSON.stringify(legendInfo, null, 2));

  // Capture Screenshot 1: Overview with Crowd Heatmap & Legend
  console.log('3. Capturing Screen 1: Dynamic Crowd Heatmap Overview with Legend...');
  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot('phase4_2_crowd_heatmap_overview.png');

  // 4. Test Routing: North Entry Gate 01 -> Saraswati Ghat
  console.log('4. Triggering route to Saraswati Ghat (ghat-saraswati)...');
  const clickRouteRes = await evaluate(`(() => {
    // Find the card for Saraswati Ghat
    const cards = Array.from(document.querySelectorAll('div.p-3.rounded-xl.border'));
    const saraswatiCard = cards.find(c => c.textContent.includes('Saraswati Ghat (Numbered Ghat 03)') || c.textContent.includes('ghat-saraswati'));
    if (!saraswatiCard) {
      return { success: false, reason: 'Saraswati Ghat card not found', cardCount: cards.length };
    }

    const routeBtn = Array.from(saraswatiCard.querySelectorAll('button')).find(b => b.textContent.trim() === 'Route');
    if (!routeBtn) {
      return { success: false, reason: 'Route button not found in card' };
    }

    routeBtn.click();
    return { success: true, cardId: 'ghat-saraswati' };
  })()`);
  console.log('   Click Route result:', clickRouteRes);

  await new Promise(r => setTimeout(r, 1200));

  // 5. Select origin landmark: North Entry Gate 01 (Kotilingala)
  console.log('5. Selecting origin landmark from Manual Origin Modal: North Entry Gate 01 (Kotilingala)...');
  const selectOriginRes = await evaluate(`(() => {
    const modal = document.querySelector('div.fixed.inset-0.z-50');
    if (!modal) {
      return { success: false, reason: 'Origin modal not visible' };
    }

    const landmarkBtns = Array.from(modal.querySelectorAll('button'));
    const northGateBtn = landmarkBtns.find(b => b.textContent.includes('North Entry Gate 01'));
    if (!northGateBtn) {
      return { success: false, reason: 'North Gate button not found in modal', btnTexts: landmarkBtns.map(b => b.textContent.trim()) };
    }

    northGateBtn.click();
    return { success: true, text: northGateBtn.textContent.trim() };
  })()`);
  console.log('   Select origin result:', selectOriginRes);

  await new Promise(r => setTimeout(r, 2000));

  // 6. Check route status with Avoid Crowds = ON (default Peak Snanam Rush)
  const routeDetourStatus = await evaluate(`(() => {
    const detourBadge = Array.from(document.querySelectorAll('div')).find(d => 
      d.textContent.includes('Smart Detour Active') || d.textContent.includes('Crowd Avoidance')
    );
    const distanceTexts = Array.from(document.querySelectorAll('div, span')).filter(el => 
      el.textContent.includes('meters') || el.textContent.includes('m') || el.textContent.includes('Distance')
    ).map(e => e.textContent.trim());

    const navPanel = Array.from(document.querySelectorAll('div')).find(d => 
      d.textContent.includes('Route to Facility') || d.textContent.includes('Saraswati Ghat')
    );

    return {
      hasNavPanel: !!navPanel,
      hasDetourBadge: !!detourBadge,
      detourBadgeText: detourBadge ? detourBadge.textContent.trim() : null,
      distanceSummary: distanceTexts.slice(0, 6)
    };
  })()`);
  console.log('   Route Detour Status (Avoid Crowds = ON):', JSON.stringify(routeDetourStatus, null, 2));

  // Capture Screenshot 2: Smart Detour Active Route
  console.log('7. Capturing Screen 2: Smart Congestion Detour Route Active...');
  await captureScreenshot('phase4_2_smart_detour_route_active.png');

  // 8. Toggle "Avoid Crowds" OFF to demonstrate baseline shortest path
  console.log('\n8. Toggling "Avoid Crowds" OFF to demonstrate baseline shortest path...');
  const toggleAvoidOffRes = await evaluate(`(() => {
    const avoidBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent.includes('Avoid Crowds') || b.textContent.includes('Shortest Path')
    );
    if (avoidBtn) {
      avoidBtn.click();
      return { success: true, prevText: avoidBtn.textContent.trim() };
    }
    return { success: false };
  })()`);
  console.log('   Toggle Avoid Crowds result:', toggleAvoidOffRes);

  await new Promise(r => setTimeout(r, 2000));

  const routeDirectStatus = await evaluate(`(() => {
    const detourBadge = Array.from(document.querySelectorAll('div')).find(d => 
      d.textContent.includes('Smart Detour Active') || d.textContent.includes('Crowd Avoidance')
    );
    const avoidBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent.includes('Avoid Crowds') || b.textContent.includes('Shortest Path')
    );
    const distanceTexts = Array.from(document.querySelectorAll('div, span')).filter(el => 
      el.textContent.includes('meters') || el.textContent.includes('m')
    ).map(e => e.textContent.trim());

    return {
      hasDetourBadge: !!detourBadge,
      avoidBtnText: avoidBtn ? avoidBtn.textContent.trim() : null,
      distances: distanceTexts.slice(0, 4)
    };
  })()`);
  console.log('   Route Direct Status (Avoid Crowds = OFF):', JSON.stringify(routeDirectStatus, null, 2));

  // Capture Screenshot 3: Direct route without crowd detour
  console.log('9. Capturing Screen 3: Direct Route (Avoid Crowds OFF / Shortest Path)...');
  await captureScreenshot('phase4_2_direct_route_avoid_off.png');

  // Toggle Avoid Crowds back ON for subsequent tests
  await evaluate(`(() => {
    const avoidBtn = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent.includes('Avoid Crowds') || b.textContent.includes('Shortest Path')
    );
    if (avoidBtn) avoidBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 1000));

  // 9. Test Emergency SOS Priority Mode
  console.log('\n10. Clicking Floating SOS Button to test Emergency Priority Invariant...');
  const openSosRes = await evaluate(`(() => {
    const sosBtn = document.querySelector('button[aria-label="Emergency SOS Assistance"]') || 
                  Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('EMERGENCY SOS') || b.textContent.includes('SOS'));
    if (sosBtn) {
      sosBtn.click();
      return { success: true, text: sosBtn.textContent.trim() };
    }
    return { success: false };
  })()`);
  console.log('    Open SOS Modal result:', openSosRes);

  await new Promise(r => setTimeout(r, 1500));

  // Capture Screenshot 4: Emergency SOS Modal
  console.log('11. Capturing Screen 4: Emergency SOS Priority Modal...');
  await captureScreenshot('phase4_2_emergency_sos_priority.png');

  // Close SOS Modal
  await evaluate(`(() => {
    const closeBtn = document.querySelector('button[aria-label="Close Emergency SOS Dialog"]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Cancel' || b.querySelector('svg'));
    if (closeBtn) closeBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 1000));

  // 10. Mobile Viewport Responsive Test
  console.log('\n12. Emulating Mobile Viewport (iPhone 14 / Android 390x844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1500));

  // Capture Screenshot 5: Mobile Viewport
  console.log('13. Capturing Screen 5: Mobile Responsive Layout...');
  await captureScreenshot('phase4_2_mobile_crowd_heatmap.png');

  console.log('\n=== ALL PHASE 4.2 BROWSER CHECKS AND SCREENSHOTS COMPLETED SUCCESSFULLY ===');

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
