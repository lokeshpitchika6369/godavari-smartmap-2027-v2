import * as THREE from 'three';
import { Facility } from '../types';

/**
 * Procedural 3D Cartoon Facility Templates for Godavari SmartMap 2027.
 * Phase 2A Upgrade: High-Capacity, Spatially Enriched Smart Festival City Models:
 * - South Indian Dravidian Temple Gopuram (17.5m high, 15m plinth, vimana tiers & Dhwajasthambham)
 * - Grand stepped bathing ghats (28m wide platforms, 6 stone tiers, Deepa Sthambha lamp pillars, twin pavilions)
 * - Large Food Stalls (8.5m x 7m with separate food prep area, serving counter, striped canopy, handwash)
 * - Large Pooja Item Stalls (8m x 7m with multi-tiered display shelves, marigold garlands, sacred brassware)
 * - Emergency Triage Hospital (11m x 8.5m with ambulance bay, triage ramp & 3D red crosses)
 * - Police Security Command Post (10m x 8m with PA speaker mast, blue beacon & missing persons desk)
 * - Grand Pushkar Triumphal Arch (18m wide, triple-portal, 5 golden kalasam finials & welcome banner)
 * - Municipal RO Drinking Water Hub (7.5m x 5m, dual dispenser bars with 8 taps & droplet emblem)
 * - Public Sanitation Complex (12m x 7.5m dual-wing Men/Women blocks, handwash troughs & louvers)
 * - Paved Parking Facility (24m x 18m with marked bays, guard booth, barrier boom & parked vehicles)
 * - APSRTC Shuttle Bus Terminal (14m x 6m dual canopy with passenger waiting benches)
 * Optimized with shared materials for high performance on Android mobile and desktop browsers.
 */

// Shared cartoon materials
const cartoonMats = {
  // Traditional / Temple
  sandstone: new THREE.MeshLambertMaterial({ color: 0xf59e0b }), // Warm cartoon sandstone
  templeRed: new THREE.MeshLambertMaterial({ color: 0xdc2626 }), // Sacred vermilion red
  templeWhite: new THREE.MeshLambertMaterial({ color: 0xffffff }), // Pure white sacred stripes
  gold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 }), // Radiant gold
  brass: new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7, roughness: 0.3 }),
  saffron: new THREE.MeshLambertMaterial({ color: 0xf97316 }), // Sacred Pushkaralu saffron
  marigold: new THREE.MeshLambertMaterial({ color: 0xfbbf24 }), // Marigold yellow
  darkWood: new THREE.MeshLambertMaterial({ color: 0x78350f }),
  lightWood: new THREE.MeshLambertMaterial({ color: 0xb45309 }),

  // Food & Stalls
  foodPink: new THREE.MeshLambertMaterial({ color: 0xec4899 }), // Vibrant candy pink
  foodWhite: new THREE.MeshLambertMaterial({ color: 0xf8fafc }),
  poojaOrange: new THREE.MeshLambertMaterial({ color: 0xea580c }),
  poojaYellow: new THREE.MeshLambertMaterial({ color: 0xfacc15 }),
  coconutGreen: new THREE.MeshLambertMaterial({ color: 0x65a30d }),

  // Civic / Emergency
  medicalWhite: new THREE.MeshLambertMaterial({ color: 0xffffff }),
  medicalRed: new THREE.MeshLambertMaterial({ color: 0xef4444 }),
  medicalBeacon: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  helpBlue: new THREE.MeshLambertMaterial({ color: 0x1d4ed8 }), // Police / Helpdesk blue
  helpLightBlue: new THREE.MeshLambertMaterial({ color: 0x38bdf8 }),
  toiletTeal: new THREE.MeshLambertMaterial({ color: 0x0d9488 }),
  toiletWhite: new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }),
  waterCyan: new THREE.MeshLambertMaterial({ color: 0x06b6d4 }),
  waterDeep: new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3, roughness: 0.1 }),
  chromeTap: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 }),

  // Ghats & Infrastructure
  ghatStone: new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }), // Clean river stone
  ghatDark: new THREE.MeshLambertMaterial({ color: 0x94a3b8 }),
  buoyOrange: new THREE.MeshBasicMaterial({ color: 0xff6600 }),
  asphalt: new THREE.MeshLambertMaterial({ color: 0x334155 }),
  busYellow: new THREE.MeshLambertMaterial({ color: 0xeab308 }),
  carWhite: new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }),
  carBlue: new THREE.MeshLambertMaterial({ color: 0x2563eb }),
  signboardDark: new THREE.MeshBasicMaterial({ color: 0x0f172a }),
  signboardText: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  flameGold: new THREE.MeshBasicMaterial({ color: 0xfef08a }),
};

/**
 * Facility Signboard Configuration & Visual Hierarchy (Phase 2)
 */
export interface FacilitySignboardConfig {
  prominentText: string;
  detailText: string;
  icon: string;
  bgColor: string;
  isMajorLandmark: boolean;
  isClusterLeader?: boolean;
  yOffset: number;
}

/**
 * Maps each facility to its visual hierarchy tier, icon and staggered height.
 */
export function getFacilitySignboardConfig(facility: Facility): FacilitySignboardConfig {
  const fid = facility.id.toLowerCase();

  // 1. Central Pushkar Arch / Central Main Gate 02 (Primary City Entrance)
  if (fid === 'gate-central-02' || fid.includes('gate-central')) {
    return {
      prominentText: 'Central Main Gate (Pushkar Arch)',
      detailText: 'Central Main Gate 02 (Pushkar Arch)',
      icon: '📍',
      bgColor: '#1d4ed8', // Royal Blue
      isMajorLandmark: true,
      yOffset: 16.5,
    };
  }

  // 2. Main Shiva Temple Complex (Highest Spiritual Landmark)
  if (fid === 'temple-kotilingeswara' || fid.includes('kotilingeswara')) {
    return {
      prominentText: 'Main Temple',
      detailText: 'Kotilingeshwara Shiva Temple Complex',
      icon: '🛕',
      bgColor: '#d97706', // Golden Amber
      isMajorLandmark: true,
      yOffset: 20.0,
    };
  }

  // 3. Markandeya Swamy Temple
  if (fid === 'temple-markandeya' || fid.includes('markandeya')) {
    return {
      prominentText: 'Markandeya Temple',
      detailText: 'Markandeya Swamy Temple',
      icon: '🛕',
      bgColor: '#b45309',
      isMajorLandmark: true,
      yOffset: 14.0,
    };
  }

  // 4. Numbered Sacred Bathing Ghats (Along Godavari Waterfront)
  if (fid === 'ghat-kotilingala' || fid.includes('kotilingala')) {
    return {
      prominentText: 'Ghat 1',
      detailText: 'Kotilingala Ghat 01',
      icon: '☲',
      bgColor: '#0284c7', // Ocean Blue
      isMajorLandmark: true,
      yOffset: 7.5,
    };
  }
  if (fid === 'ghat-pushkar' || fid.includes('pushkar')) {
    return {
      prominentText: 'Ghat 2',
      detailText: 'Pushkar Ghat (Main Central)',
      icon: '☲',
      bgColor: '#0284c7',
      isMajorLandmark: true,
      yOffset: 8.2,
    };
  }
  if (fid === 'ghat-saraswati' || fid.includes('saraswati')) {
    return {
      prominentText: 'Ghat 3',
      detailText: 'Saraswati Ghat 03',
      icon: '☲',
      bgColor: '#0284c7',
      isMajorLandmark: true,
      yOffset: 8.8,
    };
  }

  // 5. Primary Medical Aid Centre
  if (fid === 'med-centre-central' || fid === 'medical-aid-01' || fid.includes('firstaid-central')) {
    return {
      prominentText: 'Medical Centre',
      detailText: '24/7 Red Cross First Aid Post 01',
      icon: '✚',
      bgColor: '#dc2626', // Crimson Red
      isMajorLandmark: true,
      yOffset: 8.5,
    };
  }

  // 6. Police Command & Help Desk
  if (fid === 'help-centre-central' || fid.includes('police')) {
    return {
      prominentText: 'Police Help Desk',
      detailText: 'Police Command & Pilgrim Helpdesk 01',
      icon: '🛡️',
      bgColor: '#1e40af', // Deep Navy Blue
      isMajorLandmark: true,
      yOffset: 11.2,
    };
  }

  // 7. Food Stalls - Stall 101 as Cluster Leader
  if (fid === 'stall-food-101' || fid === 'stall-food-01') {
    return {
      prominentText: 'Food Stalls',
      detailText: 'Food Stall 101: Andhra Tiffins & Meals',
      icon: '🍴',
      bgColor: '#ea580c', // Bright Orange
      isMajorLandmark: true,
      isClusterLeader: true,
      yOffset: 7.2,
    };
  }

  // 8. Pooja Item Stalls - Stall 201 as Cluster Leader
  if (fid === 'stall-pooja-201' || fid === 'stall-pooja-01') {
    return {
      prominentText: 'Pooja Item Stalls',
      detailText: 'Pooja Stall 201: Sacred Diyas & Flowers',
      icon: '🌸',
      bgColor: '#db2777', // Magenta Pink
      isMajorLandmark: true,
      isClusterLeader: true,
      yOffset: 8.8,
    };
  }

  // 9. Pilgrim Parking Ground A (East Bay)
  if (fid === 'parking-east-bay' || fid === 'parking-ground-01') {
    return {
      prominentText: 'Parking Area',
      detailText: 'Pilgrim Parking Ground A (East Bay)',
      icon: '🅿',
      bgColor: '#1e293b', // Dark Slate
      isMajorLandmark: true,
      yOffset: 5.4,
    };
  }

  // 10. Transit Terminal
  if (fid.includes('bus-stop') || fid.includes('bus-terminal') || fid.includes('shuttle')) {
    return {
      prominentText: 'APSRTC Bus Terminal',
      detailText: 'Special Shuttle Terminal',
      icon: '🚌',
      bgColor: '#ca8a04',
      isMajorLandmark: true,
      yOffset: 6.2,
    };
  }

  // 11. Central Annadanam Hall
  if (
    fid === 'waiting-annadanam-central' ||
    (facility.category === 'waitingHalls' && facility.name.en.toLowerCase().includes('annadan'))
  ) {
    return {
      prominentText: 'Central Annadanam Hall',
      detailText: facility.name.en,
      icon: '🍛',
      bgColor: '#b45309',
      isMajorLandmark: true,
      yOffset: 9.5,
    };
  }

  // 12. Pinda Pradanam Mandapam
  if (fid.includes('pinda') || fid.includes('pooja-area')) {
    return {
      prominentText: 'Pinda Pradanam Mandapam',
      detailText: 'Pinda Pradanam Mandapam',
      icon: '🕉️',
      bgColor: '#ea580c',
      isMajorLandmark: true,
      yOffset: 8.0,
    };
  }

  // --- SECONDARY FACILITIES (Fallback by category) ---
  const cleanDetail =
    facility.name.en.split(':')[1]?.trim() ||
    facility.name.en.split('(')[0]?.trim() ||
    facility.name.en;

  switch (facility.category) {
    case 'foodStalls':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🍴',
        bgColor: '#ea580c',
        isMajorLandmark: false,
        yOffset: 5.8,
      };
    case 'poojaStalls':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🌸',
        bgColor: '#db2777',
        isMajorLandmark: false,
        yOffset: 7.8,
      };
    case 'water':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🚰',
        bgColor: '#0284c7',
        isMajorLandmark: false,
        yOffset: 6.8,
      };
    case 'toilets':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🚻',
        bgColor: '#0d9488',
        isMajorLandmark: false,
        yOffset: 5.6,
      };
    case 'gates':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🚪',
        bgColor: fid.includes('emergency')
          ? '#dc2626'
          : fid.includes('pedestrian')
          ? '#059669'
          : '#2563eb',
        isMajorLandmark: false,
        yOffset: 14.5,
      };
    case 'medical':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '✚',
        bgColor: '#dc2626',
        isMajorLandmark: false,
        yOffset: 6.8,
      };
    case 'helpCentres':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🛡️',
        bgColor: '#1d4ed8',
        isMajorLandmark: false,
        yOffset: 10.8,
      };
    case 'parking':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🅿',
        bgColor: '#475569',
        isMajorLandmark: false,
        yOffset: 4.8,
      };
    case 'waitingHalls':
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '🪑',
        bgColor: '#d97706',
        isMajorLandmark: false,
        yOffset: 8.2,
      };
    default:
      return {
        prominentText: cleanDetail,
        detailText: cleanDetail,
        icon: '📍',
        bgColor: '#0ea5e9',
        isMajorLandmark: false,
        yOffset: 6.2,
      };
  }
}

/**
 * Creates high-resolution prominent pill badge sprite for major landmarks and active facilities.
 */
function createPillBadgeSprite(
  text: string,
  bgColor: string,
  icon: string,
  isMajorLandmark: boolean
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 512, 128);

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // Pill Background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 54);
    ctx.fill();

    // Reset shadow for crisp border and inner text
    ctx.shadowColor = 'transparent';

    // Crisp White or Golden Border
    ctx.strokeStyle = isMajorLandmark ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Left Circular Icon Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.arc(64, 64, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '36px "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 64, 65);

    // Text: Auto-size font if text is long
    let fontSize = 30;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const maxTextWidth = 360;
    while (ctx.measureText(text).width > maxTextWidth && fontSize > 18) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    }

    // Text Shadow for contrast
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 118, 65);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(8.0, 2.0, 1);
  return sprite;
}

/**
 * Creates compact circular icon marker sprite for secondary utilities (toilets, water, individual stalls).
 */
function createCompactPinSprite(icon: string, bgColor: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 160, 160);

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Pin circle
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(80, 80, 66, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Outer white rim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Centered Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '54px "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 80, 82);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.2, 2.2, 1);
  return sprite;
}

/**
 * Creates dynamic Dual-LOD billboard group for facility identification badges on top of structures.
 */
function createFacilitySignboard(
  facilityOrText: Facility | string,
  arg1?: number | string,
  arg2?: number | string,
  arg3?: number
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'facility-signboard';

  let cfg: FacilitySignboardConfig;
  let posX = 0;
  let posY: number | undefined;
  let posZ = 0;
  let facilityId = '';
  let category = 'all';

  if (typeof facilityOrText === 'string') {
    const text = facilityOrText;
    const bgColor = typeof arg1 === 'string' ? arg1 : '#0ea5e9';
    const icon = typeof arg2 === 'string' ? arg2 : '✦';
    cfg = {
      prominentText: text,
      detailText: text,
      icon,
      bgColor,
      isMajorLandmark: true,
      yOffset: 6.0,
    };
  } else {
    const facility = facilityOrText;
    facilityId = facility.id;
    category = facility.category;
    cfg = getFacilitySignboardConfig(facility);
    posX = typeof arg1 === 'number' ? arg1 : 0;
    posY = typeof arg2 === 'number' ? arg2 : undefined;
    posZ = typeof arg3 === 'number' ? arg3 : 0;
  }

  // 1. Full Pill Badge Sprite
  const fullBadgeSprite = createPillBadgeSprite(
    cfg.prominentText,
    cfg.bgColor,
    cfg.icon,
    cfg.isMajorLandmark
  );
  fullBadgeSprite.name = 'signboard-full-badge';
  if (facilityId) {
    fullBadgeSprite.userData = { facilityId };
  }

  // 2. Compact Circular Pin Sprite
  const compactPinSprite = createCompactPinSprite(cfg.icon, cfg.bgColor);
  compactPinSprite.name = 'signboard-compact-pin';
  if (facilityId) {
    compactPinSprite.userData = { facilityId };
  }

  // Initial visibility based on landmark status
  if (cfg.isMajorLandmark) {
    fullBadgeSprite.visible = true;
    compactPinSprite.visible = false;
  } else {
    fullBadgeSprite.visible = false;
    compactPinSprite.visible = true;
  }

  group.add(fullBadgeSprite);
  group.add(compactPinSprite);

  const finalY = posY !== undefined ? posY : cfg.yOffset;
  group.position.set(posX, finalY, posZ);

  group.userData = {
    isMajorLandmark: cfg.isMajorLandmark,
    isClusterLeader: !!cfg.isClusterLeader,
    category,
    facilityId,
    prominentText: cfg.prominentText,
    detailText: cfg.detailText,
    fullBadgeSprite,
    compactPinSprite,
  };

  return group;
}

/**
 * Creates a distinct 3D cartoon model template based on the facility record.
 */
export function createFacility3DModel(facility: Facility): THREE.Group {
  const group = new THREE.Group();
  group.name = `facility-${facility.id}`;
  group.userData = {
    facilityId: facility.id,
    facility,
    isHovered: false,
    isSelected: false,
  };

  switch (facility.modelType) {
    case 'gate':
      buildCartoonGateTemplate(group, facility);
      break;
    case 'temple':
      buildCartoonTempleTemplate(group, facility);
      break;
    case 'ghat':
      buildCartoonGhatTemplate(group, facility);
      break;
    case 'stall_food':
      buildCartoonFoodStallTemplate(group, facility);
      break;
    case 'stall_pooja':
      buildCartoonPoojaStallTemplate(group, facility);
      break;
    case 'medical':
      buildCartoonMedicalTemplate(group, facility);
      break;
    case 'water':
      buildCartoonWaterTemplate(group, facility);
      break;
    case 'toilet':
      buildCartoonToiletTemplate(group, facility);
      break;
    case 'help':
      buildCartoonHelpDeskTemplate(group, facility);
      break;
    case 'announcement':
      buildCartoonAnnouncementTemplate(group, facility);
      break;
    case 'parking':
      buildCartoonParkingTemplate(group, facility);
      break;
    case 'bus_stop':
      buildCartoonBusStopTemplate(group, facility);
      break;
    case 'annadanam':
      buildCartoonAnnadanamTemplate(group, facility);
      break;
    case 'waiting_hall':
      buildCartoonWaitingHallTemplate(group, facility);
      break;
    case 'pooja_area':
      buildCartoonPoojaAreaTemplate(group, facility);
      break;
    default:
      buildCartoonDefaultTemplate(group, facility);
      break;
  }

  // Dedicated Raycast Hit Cylinder covering ground building and overhead signboard
  // Generously sized (radius 7.5m, height 18m) so mobile finger taps easily register on both small and large facilities
  const hitBoxGeo = new THREE.CylinderGeometry(7.5, 7.5, 18, 16);
  const hitBoxMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
  hitBox.name = `hitbox-${facility.id}`;
  hitBox.position.y = 9;
  hitBox.userData = {
    facilityId: facility.id,
    parentFacilityId: facility.id,
    facility,
  };
  group.add(hitBox);

  // Ground base locator disc with forward indicator
  const anchorGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.18, 24);
  const anchorMat = new THREE.MeshLambertMaterial({
    color: facility.isStall
      ? 0xf59e0b
      : facility.category === 'ghats'
      ? 0x0284c7
      : facility.category === 'temples'
      ? 0xd97706
      : 0x10b981,
    transparent: true,
    opacity: 0.55,
  });
  const anchor = new THREE.Mesh(anchorGeo, anchorMat);
  anchor.position.y = 0.09;
  group.add(anchor);

  return group;
}

// -------------------------------------------------------------
// 1. CARTOON TEMPLE TEMPLATE (Enlarged Dravidian Gopuram & Vimana)
// -------------------------------------------------------------
function buildCartoonTempleTemplate(group: THREE.Group, facility: Facility) {
  // Grand Temple Compound Plinth (15m x 15m)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(15.0, 1.4, 15.0), cartoonMats.sandstone);
  plinth.position.y = 0.7;
  group.add(plinth);

  // Sacred Temple Boundary Wall (Prakaram) with Red and White stripes
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.6, 13.5), cartoonMats.templeRed);
  wallL.position.set(-6.8, 2.5, 0);
  const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.6, 13.5), cartoonMats.templeRed);
  wallR.position.set(6.8, 2.5, 0);
  const wallB = new THREE.Mesh(new THREE.BoxGeometry(13.5, 2.6, 0.6), cartoonMats.templeRed);
  wallB.position.set(0, 2.5, -6.8);
  group.add(wallL, wallR, wallB);

  // Inner Sanctum Sanctorum (Garbhagriha)
  const sanctum = new THREE.Mesh(new THREE.BoxGeometry(8.5, 5.0, 8.5), cartoonMats.sandstone);
  sanctum.position.set(0, 3.5, -1.0);
  group.add(sanctum);

  // 4-Tiered Grand Gopuram Tower (Heights up to 17.5m)
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3.2, 7.5), cartoonMats.sandstone);
  tier1.position.set(0, 7.2, -1.0);
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.8, 5.8), cartoonMats.saffron);
  tier2.position.set(0, 10.0, -1.0);
  const tier3 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 4.2), cartoonMats.sandstone);
  tier3.position.set(0, 12.4, -1.0);
  const tier4 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 2.8), cartoonMats.saffron);
  tier4.position.set(0, 14.3, -1.0);
  group.add(tier1, tier2, tier3, tier4);

  // Golden Barrel-vaulted Shikhara Crest
  const crestGeo = new THREE.CylinderGeometry(1.4, 1.8, 3.4, 8, 1, false, 0, Math.PI);
  const crest = new THREE.Mesh(crestGeo, cartoonMats.gold);
  crest.rotation.z = Math.PI / 2;
  crest.position.set(0, 15.6, -1.0);
  group.add(crest);

  // 5 Golden Kalasam Finials on Crest
  for (const kx of [-1.2, -0.6, 0, 0.6, 1.2]) {
    const kalasam = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 8), cartoonMats.gold);
    kalasam.position.set(kx, 17.2, -1.0);
    group.add(kalasam);
  }

  // Front Mandapam Pillared Entrance Hall (4 Carved Sandstone Pillars)
  const pillarGeo = new THREE.CylinderGeometry(0.35, 0.42, 4.6, 8);
  for (const px of [-3.2, 3.2]) {
    for (const pz of [3.5, 5.5]) {
      const pillar = new THREE.Mesh(pillarGeo, cartoonMats.sandstone);
      pillar.position.set(px, 3.4, pz);
      group.add(pillar);
    }
  }

  // Mandapam Stone Roof
  const mandapamRoof = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.6, 4.0), cartoonMats.sandstone);
  mandapamRoof.position.set(0, 5.9, 4.5);
  group.add(mandapamRoof);

  // Gold-plated Dhwajasthambham (Sacred Temple Flagstaff)
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 10.0, 8), cartoonMats.gold);
  staff.position.set(0, 5.5, 6.8);
  group.add(staff);

  // Fluttering Saffron Dhwaja Flag
  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.0, 3), cartoonMats.saffron);
  flag.rotation.z = Math.PI / 2;
  flag.position.set(1.0, 9.8, 6.8);
  group.add(flag);

  // Hanging Brass Temple Bell
  const bell = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.65, 8), cartoonMats.brass);
  bell.rotation.x = Math.PI;
  bell.position.set(0, 5.0, 3.8);
  group.add(bell);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 19.5, -1.0);
  sign.position.set(0, 18.8, -1.0);
  group.add(sign);
}

// -------------------------------------------------------------
// 2. CARTOON GHAT TEMPLATE (28m Wide High-Capacity Stepped Bathing Ghat)
// -------------------------------------------------------------
function buildCartoonGhatTemplate(group: THREE.Group, facility: Facility) {
  // Cascading Stone Tiers descending toward Godavari water (-X direction)
  // Width along Z expanded to 28.0m for high pilgrim bathing capacity
  const stepCount = 6;
  for (let i = 0; i < stepCount; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.24, 28.0),
      i % 2 === 0 ? cartoonMats.ghatStone : cartoonMats.ghatDark
    );
    // Step down towards negative X (into the river)
    step.position.set(-i * 1.6, -i * 0.12, 0);
    group.add(step);
  }

  // Two Grand Deepa Sthambha Entrance Lamp Pillars (Height 6.5m)
  const pillarGeo = new THREE.CylinderGeometry(0.42, 0.55, 6.0, 8);
  for (const pz of [-12.0, 12.0]) {
    const pillar = new THREE.Mesh(pillarGeo, cartoonMats.sandstone);
    pillar.position.set(1.4, 3.0, pz);
    group.add(pillar);

    // Pillar Brass Ring Capital
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.45, 0.5, 8), cartoonMats.brass);
    cap.position.set(1.4, 6.2, pz);
    group.add(cap);

    // Glowing Sacred Golden Diya / Fire Lamp
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), cartoonMats.flameGold);
    lamp.position.set(1.4, 6.8, pz);
    group.add(lamp);
  }

  // Ceremonial Ghat Entrance Arch
  const archLintel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 25.0), cartoonMats.saffron);
  archLintel.position.set(1.4, 5.8, 0);
  group.add(archLintel);

  // Dual Shaded Bathing / Changing Pavilions on North and South Flanks
  for (const cz of [-9.5, 9.5]) {
    // Pavilion Plinth
    const pavPlinth = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.4, 4.5), cartoonMats.ghatStone);
    pavPlinth.position.set(-1.5, 0.3, cz);
    group.add(pavPlinth);

    // 4 Corner Brass Poles
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6);
    for (const px of [-2.8, -0.2]) {
      for (const pz of [cz - 1.8, cz + 1.8]) {
        const pole = new THREE.Mesh(poleGeo, cartoonMats.brass);
        pole.position.set(px, 1.8, pz);
        group.add(pole);
      }
    }

    // Terracotta Hipped Canopy Roof
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.6, 4), cartoonMats.saffron);
    canopy.rotation.y = Math.PI / 4;
    canopy.position.set(-1.5, 3.8, cz);
    group.add(canopy);
  }

  // Floating Orange River Safety Buoys along the 28m bathing perimeter
  for (let bz = -12.0; bz <= 12.0; bz += 3.0) {
    const buoy = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), cartoonMats.buoyOrange);
    buoy.position.set(-9.5, -0.22, bz);
    group.add(buoy);
  }

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 1.4, 7.8, 0);
  sign.position.set(1.4, 7.8, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 3. CARTOON FOOD STALL TEMPLATE (Enlarged 8.5m x 7m with Prep & Service Areas)
// -------------------------------------------------------------
function buildCartoonFoodStallTemplate(group: THREE.Group, facility: Facility) {
  // Wood Platform Deck (8.5m wide x 7.0m deep)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.4, 7.0), cartoonMats.lightWood);
  deck.position.y = 0.2;
  group.add(deck);

  // Rear Food Preparation Kitchen Area
  const kitchenCounter = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.4, 1.8), cartoonMats.darkWood);
  kitchenCounter.position.set(0, 1.0, -2.0);
  group.add(kitchenCounter);

  // Traditional Clay Tandoor & Cooking Pots
  const tandoor = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 1.2, 8), cartoonMats.sandstone);
  tandoor.position.set(-2.5, 1.6, -2.0);
  group.add(tandoor);

  for (const vx of [0.0, 1.5, 2.8]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.6, 8), cartoonMats.gold);
    pot.position.set(vx, 1.9, -2.0);
    group.add(pot);
  }

  // Front Service & Order Counter
  const serviceCounter = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.4, 1.4), cartoonMats.darkWood);
  serviceCounter.position.set(0, 1.0, 1.8);
  group.add(serviceCounter);

  // Serving Trays & Heated Display Counter
  for (const sx of [-2.2, -0.6, 1.0, 2.4]) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.0), cartoonMats.chromeTap);
    tray.position.set(sx, 1.75, 1.8);
    group.add(tray);
  }

  // 6 Support Columns for Wide Canopy
  const colGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.0, 6);
  for (const cx of [-3.8, 0, 3.8]) {
    for (const cz of [-3.0, 3.0]) {
      const col = new THREE.Mesh(colGeo, cartoonMats.brass);
      col.position.set(cx, 2.2, cz);
      group.add(col);
    }
  }

  // Striped Slanted Canopy Roof (Festive Orange & White Stripes)
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.35, 7.8), cartoonMats.poojaOrange);
  canopy.position.set(0, 4.4, 0);
  canopy.rotation.x = -0.10;
  group.add(canopy);

  // Scalloped Front Valance Overhang
  const valance = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.7, 0.1), cartoonMats.foodWhite);
  valance.position.set(0, 4.0, 3.8);
  group.add(valance);

  // Cleanliness Station: Side Waste Segregation Bins & Handwash Basin
  const binGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.0, 8);
  const greenBin = new THREE.Mesh(binGeo, cartoonMats.coconutGreen);
  greenBin.position.set(4.6, 0.6, 2.2);
  const blueBin = new THREE.Mesh(binGeo, cartoonMats.waterCyan);
  blueBin.position.set(4.6, 0.6, 1.0);
  group.add(greenBin, blueBin);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 5.8, 0.5);
  sign.position.set(0, 5.8, 0.5);
  group.add(sign);
}

// -------------------------------------------------------------
// 4. CARTOON POOJA STALL TEMPLATE (Enlarged 8m x 7m Multi-Tier Market Stall)
// -------------------------------------------------------------
function buildCartoonPoojaStallTemplate(group: THREE.Group, facility: Facility) {
  // Timber Platform (8.0m wide x 7.0m deep)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.4, 7.0), cartoonMats.lightWood);
  deck.position.y = 0.2;
  group.add(deck);

  // Multi-Tiered Stepped Display Racks (Rear & Center)
  for (let t = 0; t < 3; t++) {
    const tier = new THREE.Mesh(
      new THREE.BoxGeometry(7.0, 0.35, 1.2),
      cartoonMats.darkWood
    );
    tier.position.set(0, 0.6 + t * 0.45, -2.2 + t * 1.1);
    group.add(tier);

    // Sacred Offerings on each tier: Coconuts, Marigolds & River Diyas
    for (const ox of [-2.4, -1.2, 0, 1.2, 2.4]) {
      if (t === 0) {
        // Green Coconuts
        const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), cartoonMats.coconutGreen);
        coconut.position.set(ox, 1.0, -2.2);
        group.add(coconut);
      } else if (t === 1) {
        // Radiant Marigold Garlands
        const garland = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 6, 10), cartoonMats.marigold);
        garland.position.set(ox, 1.45, -1.1);
        group.add(garland);
      } else {
        // Brass River Diya Lamps
        const diya = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 6), cartoonMats.brass);
        diya.rotation.x = Math.PI;
        diya.position.set(ox, 1.85, 0.0);
        group.add(diya);
      }
    }
  }

  // Front Customer Service Counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.3, 1.2), cartoonMats.darkWood);
  counter.position.set(0, 0.9, 2.0);
  group.add(counter);

  // Brass Holy Water Kalasham Urns on Front Counter
  for (const kx of [-2.2, 0, 2.2]) {
    const kalasham = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), cartoonMats.gold);
    kalasham.position.set(kx, 1.8, 2.0);
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 6), cartoonMats.gold);
    finial.position.set(kx, 2.2, 2.0);
    group.add(kalasham, finial);
  }

  // 6 Decorative Brass Support Columns
  const colGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.2, 6);
  for (const px of [-3.6, 0, 3.6]) {
    for (const pz of [-3.0, 3.0]) {
      const col = new THREE.Mesh(colGeo, cartoonMats.brass);
      col.position.set(px, 2.2, pz);
      group.add(col);
    }
  }

  // Sacred Pink & Saffron Pagoda Canopy Roof
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.2, 4), cartoonMats.foodPink);
  canopy.rotation.y = Math.PI / 4;
  canopy.position.set(0, 4.8, 0);
  group.add(canopy);

  // Golden Pinnacle Spire
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 1.6, 8), cartoonMats.gold);
  spire.position.set(0, 6.2, 0);
  const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), cartoonMats.gold);
  finialBall.position.set(0, 7.0, 0);
  group.add(spire, finialBall);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 7.8, 0.5);
  group.add(sign);
}

// -------------------------------------------------------------
// 5. CARTOON MEDICAL CENTRE TEMPLATE (11m x 8.5m Emergency Triage Station)
// -------------------------------------------------------------
function buildCartoonMedicalTemplate(group: THREE.Group, facility: Facility) {
  // Main Emergency Clinic Pavilion (11.0m x 8.5m)
  const clinic = new THREE.Mesh(new THREE.BoxGeometry(11.0, 4.4, 8.5), cartoonMats.medicalWhite);
  clinic.position.y = 2.4;
  group.add(clinic);

  // Red Clinic Base Trim
  const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.45, 8.9), cartoonMats.medicalRed);
  baseTrim.position.y = 0.22;
  group.add(baseTrim);

  // Bold 3D Red Medical Cross on Front Facade
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.6, 0.2), cartoonMats.medicalRed);
  crossV.position.set(0, 2.8, 4.35);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.2), cartoonMats.medicalRed);
  crossH.position.set(0, 2.8, 4.35);
  group.add(crossV, crossH);

  // Bold Red Cross on Roof for aerial recognition
  const roofCrossV = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 4.0), cartoonMats.medicalRed);
  roofCrossV.position.set(0, 4.65, 0);
  const roofCrossH = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.15, 1.2), cartoonMats.medicalRed);
  roofCrossH.position.set(0, 4.65, 0);
  group.add(roofCrossV, roofCrossH);

  // Overhanging Covered Ambulance Triage Bay
  const ambulanceAwning = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.35, 4.0), cartoonMats.medicalRed);
  ambulanceAwning.position.set(-2.5, 3.8, 5.2);
  ambulanceAwning.rotation.x = 0.10;
  group.add(ambulanceAwning);

  // Accessible Patient Entrance Ramp
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 3.2), cartoonMats.asphalt);
  ramp.position.set(3.2, 0.15, 4.8);
  ramp.rotation.x = -0.08;
  group.add(ramp);

  // Rotating Emergency Red Beacon Light on Roof
  const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.4, 8), cartoonMats.asphalt);
  beaconBase.position.set(0, 4.8, 0);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), cartoonMats.medicalBeacon);
  beacon.position.set(0, 5.2, 0);
  group.add(beaconBase, beacon);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 7.2, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 6. CARTOON HELPDESK & POLICE BOOTH (10m x 8m Command Center)
// -------------------------------------------------------------
function buildCartoonHelpDeskTemplate(group: THREE.Group, facility: Facility) {
  // Police Command Building (10.0m x 8.0m)
  const building = new THREE.Mesh(new THREE.BoxGeometry(10.0, 4.2, 8.0), cartoonMats.helpBlue);
  building.position.y = 2.2;
  group.add(building);

  // Front Glass Observation Window Band
  const windowBand = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.4, 0.2), cartoonMats.helpLightBlue);
  windowBand.position.set(0, 2.6, 4.1);
  group.add(windowBand);

  // Public Missing Persons & Assistance Front Counter
  const serviceDesk = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.2, 1.6), cartoonMats.sandstone);
  serviceDesk.position.set(0, 0.8, 4.8);
  group.add(serviceDesk);

  // Elevated Public Address & Surveillance Antenna Mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8), cartoonMats.asphalt);
  mast.position.set(0, 6.5, 0);
  group.add(mast);

  // 4-Horn Directional PA Megaphone Cluster
  const hornGeo = new THREE.ConeGeometry(0.45, 0.9, 6);
  for (let i = 0; i < 4; i++) {
    const horn = new THREE.Mesh(hornGeo, cartoonMats.gold);
    horn.rotation.z = Math.PI / 2;
    horn.rotation.y = (i * Math.PI) / 2;
    horn.position.set(Math.cos((i * Math.PI) / 2) * 0.9, 8.2, Math.sin((i * Math.PI) / 2) * 0.9);
    group.add(horn);
  }

  // Flashing Police Blue Dome Beacon
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), cartoonMats.helpLightBlue);
  beacon.position.set(0, 9.4, 0);
  group.add(beacon);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 10.8, 0);
  sign.position.set(0, 10.8, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 7. CARTOON ANNOUNCEMENT & CONTROL ROOM BOOTH
// -------------------------------------------------------------
function buildCartoonAnnouncementTemplate(group: THREE.Group, facility: Facility) {
  // Elevated Control Room Tower (12m High)
  const tower = new THREE.Mesh(new THREE.BoxGeometry(5.8, 6.5, 5.8), cartoonMats.helpBlue);
  tower.position.y = 3.4;
  group.add(tower);

  // Observation Glass Deck
  const glass = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.8, 6.2), cartoonMats.helpLightBlue);
  glass.position.y = 5.2;
  group.add(glass);

  // Antenna Mast with 4 Megaphones
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 6.0, 8), cartoonMats.brass);
  mast.position.set(0, 9.2, 0);
  group.add(mast);

  for (let i = 0; i < 4; i++) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 6), cartoonMats.saffron);
    horn.rotation.z = Math.PI / 2;
    horn.rotation.y = (i * Math.PI) / 2;
    horn.position.set(Math.cos((i * Math.PI) / 2) * 1.0, 10.2, Math.sin((i * Math.PI) / 2) * 1.0);
    group.add(horn);
  }

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 12.0, 0);
  sign.position.set(0, 12.0, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 8. CARTOON RO DRINKING WATER KIOSK (7.5m x 5m Municipal Water Hub)
// -------------------------------------------------------------
function buildCartoonWaterTemplate(group: THREE.Group, facility: Facility) {
  // Clean Cyan Water Kiosk (7.5m x 5.0m)
  const booth = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3.4, 5.0), cartoonMats.waterCyan);
  booth.position.y = 1.8;
  group.add(booth);

  // Dual Stainless Steel Multi-Tap Dispenser Bars (8 Taps Total)
  for (const cz of [-2.6, 2.6]) {
    const basin = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 1.0), cartoonMats.chromeTap);
    basin.position.set(0, 1.2, cz);
    group.add(basin);

    for (let tx = -2.2; tx <= 2.2; tx += 1.4) {
      const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 6), cartoonMats.chromeTap);
      tap.position.set(tx, 1.6, cz);
      group.add(tap);
    }
  }

  // Giant 3D Water Droplet Emblem on Roof
  const dropletBottom = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), cartoonMats.waterDeep);
  dropletBottom.position.set(0, 4.2, 0);
  const dropletTop = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 12), cartoonMats.waterDeep);
  dropletTop.position.set(0, 5.0, 0);
  group.add(dropletBottom, dropletTop);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 6.2, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 9. CARTOON PUBLIC TOILET TEMPLATE (12m x 7.5m Dual-Wing Complex)
// -------------------------------------------------------------
function buildCartoonToiletTemplate(group: THREE.Group, facility: Facility) {
  // Main Sanitation Block (12.0m x 7.5m)
  const block = new THREE.Mesh(new THREE.BoxGeometry(12.0, 3.8, 7.5), cartoonMats.toiletTeal);
  block.position.y = 2.0;
  group.add(block);

  // Segregated Men's (Left) and Women's (Right) Privacy Entrance Baffles
  const baffleL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.0, 0.3), cartoonMats.toiletWhite);
  baffleL.position.set(-3.5, 1.6, 4.0);
  const baffleR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.0, 0.3), cartoonMats.toiletWhite);
  baffleR.position.set(3.5, 1.6, 4.0);
  group.add(baffleL, baffleR);

  // External Multi-Tap Handwashing Trough
  const washTrough = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 1.0), cartoonMats.chromeTap);
  washTrough.position.set(0, 1.1, 4.2);
  group.add(washTrough);

  for (let tx = -1.4; tx <= 1.4; tx += 0.9) {
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), cartoonMats.chromeTap);
    tap.position.set(tx, 1.45, 4.2);
    group.add(tap);
  }

  // Roof Ventilation Louvers
  const vent = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.6, 4.5), cartoonMats.toiletWhite);
  vent.position.set(0, 4.2, 0);
  group.add(vent);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 5.6, 0);
  sign.position.set(0, 5.6, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 10. CARTOON GATE TEMPLATE (18m Wide Grand Pushkar Triumphal Arch)
// -------------------------------------------------------------
function buildCartoonGateTemplate(group: THREE.Group, facility: Facility) {
  // 4 Grand Carved Sandstone Pilasters (Triple Portal Gateway)
  const pillarGeo = new THREE.BoxGeometry(2.2, 9.5, 2.2);
  for (const px of [-8.0, -3.0, 3.0, 8.0]) {
    const pillar = new THREE.Mesh(pillarGeo, cartoonMats.sandstone);
    pillar.position.set(px, 4.8, 0);
    group.add(pillar);

    // Carved Capital Trim
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.6, 2.8), cartoonMats.gold);
    cap.position.set(px, 9.8, 0);
    group.add(cap);
  }

  // Grand Gold Central Lintel Arch (Spanning 18.0m across roadway)
  const arch = new THREE.Mesh(new THREE.BoxGeometry(18.5, 2.0, 2.6), cartoonMats.gold);
  arch.position.set(0, 10.6, 0);
  group.add(arch);

  // 5 Golden Kalasam Finials along Crest
  for (const kx of [-7.0, -3.5, 0, 3.5, 7.0]) {
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.4, 8), cartoonMats.gold);
    finial.position.set(kx, 12.3, 0);
    group.add(finial);
  }

  // Saffron Festival Welcome Banner
  const banner = new THREE.Mesh(new THREE.BoxGeometry(15.0, 1.4, 0.3), cartoonMats.saffron);
  banner.position.set(0, 9.0, 0);
  group.add(banner);

  // Dual Fluttering Festival Pennant Masts on Outer Pillars
  for (const fx of [-8.0, 8.0]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4.5, 6), cartoonMats.brass);
    mast.position.set(fx, 12.5, 0);
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.6, 3), cartoonMats.saffron);
    flag.rotation.z = Math.PI / 2;
    flag.position.set(fx + (fx < 0 ? -0.8 : 0.8), 13.5, 0);
    group.add(mast, flag);
  }

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 14.5, 0);
  sign.position.set(0, 14.5, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 11. CARTOON BUS STOP & TRANSIT TERMINAL (14m x 6m APSRTC Terminal)
// -------------------------------------------------------------
function buildCartoonBusStopTemplate(group: THREE.Group, facility: Facility) {
  // Dual Curved Yellow Passenger Shelter Canopies (14.0m x 6.0m)
  const shelter = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.35, 6.0), cartoonMats.busYellow);
  shelter.position.set(0, 3.6, 0);
  shelter.rotation.x = -0.12;
  group.add(shelter);

  // 5 Support Columns
  const colGeo = new THREE.CylinderGeometry(0.14, 0.14, 3.6, 8);
  for (const cx of [-5.5, -2.75, 0, 2.75, 5.5]) {
    const col = new THREE.Mesh(colGeo, cartoonMats.asphalt);
    col.position.set(cx, 1.8, -2.2);
    group.add(col);
  }

  // Continuous Passenger Waiting Benches
  const bench = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.5, 1.1), cartoonMats.lightWood);
  bench.position.set(0, 0.6, -1.2);
  group.add(bench);

  // Route Timetable Information Board
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 0.15), cartoonMats.signboardDark);
  board.position.set(0, 2.2, -2.3);
  group.add(board);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 5.8, 0);
  sign.position.set(0, 5.4, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 12. CARTOON PARKING LOT TEMPLATE (24m x 18m Paved Facility with 3D Vehicles)
// -------------------------------------------------------------
function buildCartoonParkingTemplate(group: THREE.Group, facility: Facility) {
  // Expansive Paved Asphalt Parking Ground (24.0m x 18.0m)
  const base = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.25, 18.0), cartoonMats.asphalt);
  base.position.y = 0.12;
  group.add(base);

  // White Parking Stall Demarcation Lines
  for (let z = -7.0; z <= 7.0; z += 3.5) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(20.0, 0.28, 0.22), cartoonMats.medicalWhite);
    line.position.set(0, 0.15, z);
    group.add(line);
  }

  // Security Guard Entry Booth
  const booth = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 2.0), cartoonMats.busYellow);
  booth.position.set(-10.5, 1.4, 7.5);
  const barrierArm = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.2, 0.2), cartoonMats.medicalRed);
  barrierArm.position.set(-6.5, 1.6, 7.5);
  group.add(booth, barrierArm);

  if (facility.id.includes('two-wheeler')) {
    // Two-Wheeler Lot: multiple rows of motorcycles/scooters
    const bikeMats = [cartoonMats.carBlue, cartoonMats.medicalRed, cartoonMats.asphalt, cartoonMats.gold];
    for (const row of [-3.5, 3.5]) {
      for (let bx = -7.0; bx <= 7.0; bx += 2.8) {
        const mat = bikeMats[Math.abs(Math.floor(bx + row)) % bikeMats.length];
        const bikeBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.5), mat);
        bikeBody.position.set(bx, 0.55, row);
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.8), cartoonMats.chromeTap);
        handle.position.set(bx + 0.5, 1.05, row);
        group.add(bikeBody, handle);
      }
    }
  } else if (facility.id.includes('bus') || facility.id.includes('terminal')) {
    // Heavy Vehicle / Bus Terminal: 2 full-scale pilgrim transit buses
    const bus1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 2.4, 2.8), cartoonMats.busYellow);
    bus1.position.set(-4.0, 1.4, -4.0);
    const roof1 = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.3, 2.6), cartoonMats.foodWhite);
    roof1.position.set(-4.0, 2.7, -4.0);

    const bus2 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 2.4, 2.8), cartoonMats.carBlue);
    bus2.position.set(-4.0, 1.4, 3.5);
    const roof2 = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.3, 2.6), cartoonMats.foodWhite);
    roof2.position.set(-4.0, 2.7, 3.5);
    group.add(bus1, roof1, bus2, roof2);
  } else {
    // Standard Mixed Car/Bus lot
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.2, 2.6), cartoonMats.busYellow);
    busBody.position.set(-4.5, 1.3, -4.0);
    const busRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.3, 2.4), cartoonMats.foodWhite);
    busRoof.position.set(-4.5, 2.5, -4.0);
    group.add(busBody, busRoof);

    const car1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 1.8), cartoonMats.carWhite);
    car1.position.set(4.5, 0.9, -4.0);
    const car2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 1.8), cartoonMats.carBlue);
    car2.position.set(4.5, 0.9, 3.5);
    group.add(car1, car2);
  }

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 4.8, 0);
  sign.position.set(0, 4.8, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 13. CARTOON WAITING HALL & REST PAVILION (14m x 10m Pavilion)
// -------------------------------------------------------------
function buildCartoonWaitingHallTemplate(group: THREE.Group, facility: Facility) {
  // Arched Pavilion Sandstone Plinth (14.0m x 10.0m)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.5, 10.0), cartoonMats.sandstone);
  plinth.position.y = 0.25;
  group.add(plinth);

  // Arched Barrel Vault Roof
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 13.0, 12, 1, false, 0, Math.PI), cartoonMats.saffron);
  roof.rotation.z = Math.PI / 2;
  roof.position.set(0, 5.2, 0);
  group.add(roof);

  // 8 Perimeter Stone Columns
  const pillarGeo = new THREE.CylinderGeometry(0.24, 0.28, 4.5, 8);
  for (const px of [-5.8, 5.8]) {
    for (const pz of [-4.0, -1.3, 1.3, 4.0]) {
      const p = new THREE.Mesh(pillarGeo, cartoonMats.sandstone);
      p.position.set(px, 2.5, pz);
      group.add(p);
    }
  }

  // Interior Wooden Rest Benches
  for (const bz of [-2.5, 2.5]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.5, 1.2), cartoonMats.lightWood);
    bench.position.set(0, 0.6, bz);
    group.add(bench);
  }

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 8.2, 0);
  sign.position.set(0, 8.2, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// 14. CARTOON POOJA RITUAL MANDAPAM (12m x 10m Covered Mandapam)
// -------------------------------------------------------------
function buildCartoonPoojaAreaTemplate(group: THREE.Group, facility: Facility) {
  // Ritual Mandapam Base (12.0m x 10.0m)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.6, 10.0), cartoonMats.sandstone);
  plinth.position.y = 0.3;
  group.add(plinth);

  // Sacred Havan Fire Pit in Center
  const pit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), cartoonMats.templeRed);
  pit.position.y = 0.8;
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 6), cartoonMats.flameGold);
  flame.position.y = 1.6;
  group.add(pit, flame);

  // 6 Wooden Columns Supporting Sacred Canopy
  const colGeo = new THREE.CylinderGeometry(0.2, 0.25, 4.4, 8);
  for (const px of [-4.8, 0, 4.8]) {
    for (const pz of [-3.8, 3.8]) {
      const col = new THREE.Mesh(colGeo, cartoonMats.lightWood);
      col.position.set(px, 2.4, pz);
      group.add(col);
    }
  }

  // Pyramidal Saffron Canopy Roof
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(7.0, 2.5, 4), cartoonMats.poojaOrange);
  canopy.rotation.y = Math.PI / 4;
  canopy.position.set(0, 5.6, 0);
  group.add(canopy);

  // Overhead Signboard
  const sign = createFacilitySignboard(facility, 0, 7.8, 0);
  sign.position.set(0, 7.8, 0);
  group.add(sign);
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// 16. CARTOON ANNADANAM / ANNAPRASADAM COMMUNITY DINING HALL (18m x 12m)
// -------------------------------------------------------------
function buildCartoonAnnadanamTemplate(group: THREE.Group, facility: Facility) {
  // Broad Sandstone Dining Plinth (18.0m x 12.0m)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.6, 12.0), cartoonMats.sandstone);
  plinth.position.y = 0.3;
  group.add(plinth);

  // Main Community Dining Pavilion (16.0m x 10.0m x 4.4m)
  const hall = new THREE.Mesh(new THREE.BoxGeometry(16.0, 4.4, 10.0), cartoonMats.sandstone);
  hall.position.y = 2.5;
  group.add(hall);

  // Pitched Saffron Slanted Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(12.0, 3.2, 4), cartoonMats.saffron);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.4, 1.0, 0.9);
  roof.position.set(0, 6.2, 0);
  group.add(roof);

  // 4 Ventilation Chimney / Exhaust Cowls on Roof
  const ventGeo = new THREE.BoxGeometry(0.8, 1.0, 0.8);
  for (const vx of [-4.5, 4.5]) {
    for (const vz of [-2.0, 2.0]) {
      const vent = new THREE.Mesh(ventGeo, cartoonMats.medicalWhite);
      vent.position.set(vx, 6.8, vz);
      group.add(vent);
    }
  }

  // Front Shaded Entrance Portico
  const portico = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.35, 3.2), cartoonMats.lightWood);
  portico.position.set(0, 3.8, 6.6);
  group.add(portico);

  const colGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.8, 8);
  for (const cx of [-3.6, -1.2, 1.2, 3.6]) {
    const col = new THREE.Mesh(colGeo, cartoonMats.sandstone);
    col.position.set(cx, 1.9, 7.8);
    group.add(col);
  }

  // Side Prasadam Kitchen / Cooking Annex
  const kitchen = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 4.2), cartoonMats.foodWhite);
  kitchen.position.set(9.2, 1.9, 0);
  group.add(kitchen);

  // External Handwash Station (Stainless Steel Trough with Taps)
  const washTrough = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 0.8), cartoonMats.chromeTap);
  washTrough.position.set(-6.0, 0.9, 6.8);
  group.add(washTrough);

  // Overhead Signboard with Food Bowl Icon
  const sign = createFacilitySignboard(facility, 0, 8.8, 0);
  sign.position.set(0, 8.5, 0);
  group.add(sign);
}

// 15. DEFAULT FALLBACK TEMPLATE
// -------------------------------------------------------------
function buildCartoonDefaultTemplate(group: THREE.Group, facility: Facility) {
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, 4.0, 8), cartoonMats.sandstone);
  pin.position.y = 2.0;
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), cartoonMats.gold);
  sphere.position.y = 4.5;
  group.add(pin, sphere);

  const sign = createFacilitySignboard(facility, 0, 6.2, 0);
  sign.position.set(0, 6.2, 0);
  group.add(sign);
}
