import * as THREE from 'three';

/**
 * Cartoon Environment Builder for Godavari SmartMap 2027.
 * Implements a vibrant, friendly, stylized 3D environment for the Godavari riverfront:
 * - Natural curved Godavari River with flowing water ripple animation & shoreline foam
 * - Floating ceremonial pilgrim boats (Pushkaralu Naavas) strictly in the water
 * - Continuous stepped stone ghat embankments connecting the water to the promenade
 * - Wide sandstone riverbank promenade with decorative brass balustrades & heritage lampposts
 * - Bund road with pedestrian zebra crosswalks and connecting paved plazas
 * - Stylized palm trees, shade trees, and marigold planter boxes
 * Optimized for lightweight WebGL rendering on mobile and desktop browsers.
 */

export interface CartoonEnvironmentController {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  foamRibbon: THREE.Mesh;
  boats: THREE.Group[];
  update: (time: number, delta: number) => void;
}

/**
 * Mathematical curve representing the authentic shoreline of the Godavari riverfront in Rajahmundry.
 * Accurately aligns with historical ghats:
 * - Kotilingala Ghat: z = -52.2, x = -39.3
 * - Pushkar Ghat: z = 11.1, x = -3.2
 * - Saraswati Ghat: z = 52.2, x = 31.9
 */
export function getNaturalShorelineX(z: number): number {
  if (z <= 11.1) {
    const t = (z - (-52.2)) / (11.1 - (-52.2));
    return -39.3 + t * (-3.2 - (-39.3));
  } else {
    const t = (z - 11.1) / (52.2 - 11.1);
    return -3.2 + t * (31.9 - (-3.2));
  }
}

// Shared cartoon environment materials
const envMats = {
  // Water
  riverBase: new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Deep vibrant river cyan-blue
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  }),
  riverWaves: new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    wireframe: false,
    side: THREE.DoubleSide,
  }),
  shoreFoam: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  }),
  boatWood: new THREE.MeshLambertMaterial({ color: 0x854d0e }),
  boatTrim: new THREE.MeshLambertMaterial({ color: 0xf59e0b }),
  boatCloth: new THREE.MeshLambertMaterial({ color: 0xf97316 }), // Sacred saffron boat canopy
  flagRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),

  // Promenades & Land
  riverwalkStone: new THREE.MeshLambertMaterial({ color: 0xfde047 }), // Warm sandstone promenade
  promenadeBorder: new THREE.MeshLambertMaterial({ color: 0xd97706 }), // Amber stone edging
  groundGrass: new THREE.MeshLambertMaterial({ color: 0x15803d }), // Festive lush green parkland
  pavedPlaza: new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }), // Clean stone plaza
  bundRoad: new THREE.MeshLambertMaterial({ color: 0x334155 }), // Smooth dark asphalt
  roadMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  crosswalkWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),

  // Railings & Lampposts
  brassPost: new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 }),
  railingChain: new THREE.MeshLambertMaterial({ color: 0xb45309 }),
  lampPost: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 }),
  lampGlow: new THREE.MeshBasicMaterial({ color: 0xfef08a }), // Warm glowing street light

  // Trees & Nature
  palmTrunk: new THREE.MeshLambertMaterial({ color: 0x78350f }),
  palmLeaves: new THREE.MeshLambertMaterial({ color: 0x16a34a }),
  banyanTrunk: new THREE.MeshLambertMaterial({ color: 0x573917 }),
  banyanFoliage: new THREE.MeshLambertMaterial({ color: 0x15803d }),
  marigoldOrange: new THREE.MeshLambertMaterial({ color: 0xf97316 }),
  planterStone: new THREE.MeshLambertMaterial({ color: 0x94a3b8 }),
  skywalkSteel: new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.3 }),
  skywalkGlass: new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, roughness: 0.1 }),
  skywalkWhite: new THREE.MeshLambertMaterial({ color: 0xf8fafc }),
};

/**
 * Builds a continuous ribbon buffer geometry connecting two curved X boundaries along Z.
 */
function createRibbonGeometry(
  zMin: number,
  zMax: number,
  zSteps: number,
  xLeftFn: (z: number) => number,
  xRightFn: (z: number) => number,
  yHeight: number,
  xDivisions = 1
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= zSteps; j++) {
    const tz = j / zSteps;
    const z = zMin + tz * (zMax - zMin);
    const xL = xLeftFn(z);
    const xR = xRightFn(z);

    for (let i = 0; i <= xDivisions; i++) {
      const tx = i / xDivisions;
      const x = xL + tx * (xR - xL);
      positions.push(x, yHeight, z);
      uvs.push(tx, tz);
    }
  }

  const rowStride = xDivisions + 1;
  for (let j = 0; j < zSteps; j++) {
    for (let i = 0; i < xDivisions; i++) {
      const a = j * rowStride + i;
      const b = j * rowStride + (i + 1);
      const c = (j + 1) * rowStride + i;
      const d = (j + 1) * rowStride + (i + 1);

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

/**
 * Builds a ceremonial pilgrim boat floating on the Godavari.
 */
function createCartoonBoat(x: number, z: number, rotationY = 0): THREE.Group {
  const boat = new THREE.Group();
  boat.position.set(x, -0.15, z);
  boat.rotation.y = rotationY;

  // Boat Hull
  const hullGeo = new THREE.CylinderGeometry(1.6, 1.1, 8.5, 8, 1, false, 0, Math.PI);
  const hull = new THREE.Mesh(hullGeo, envMats.boatWood);
  hull.rotation.z = Math.PI / 2;
  hull.rotation.y = Math.PI / 2;
  hull.scale.set(0.7, 1.2, 0.9);
  boat.add(hull);

  // Deck floor
  const deckGeo = new THREE.BoxGeometry(2.2, 0.15, 7.8);
  const deck = new THREE.Mesh(deckGeo, envMats.boatTrim);
  deck.position.y = 0.5;
  boat.add(deck);

  // Saffron Sunshade Canopy
  const canopyGeo = new THREE.CylinderGeometry(1.4, 1.4, 4.0, 8, 1, false, 0, Math.PI);
  const canopy = new THREE.Mesh(canopyGeo, envMats.boatCloth);
  canopy.rotation.z = Math.PI / 2;
  canopy.position.set(0, 1.7, 0);
  boat.add(canopy);

  // Canopy support poles
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
  for (const px of [-0.9, 0.9]) {
    for (const pz of [-1.8, 1.8]) {
      const pole = new THREE.Mesh(poleGeo, envMats.brassPost);
      pole.position.set(px, 1.0, pz);
      boat.add(pole);
    }
  }

  // Mast & Triangular Festival Pennant
  const mastGeo = new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8);
  const mast = new THREE.Mesh(mastGeo, envMats.brassPost);
  mast.position.set(0, 1.8, -3.2);
  boat.add(mast);

  const flagGeo = new THREE.ConeGeometry(0.35, 0.8, 3);
  const flag = new THREE.Mesh(flagGeo, envMats.flagRed);
  flag.rotation.z = Math.PI / 2;
  flag.position.set(0.35, 3.1, -3.2);
  boat.add(flag);

  return boat;
}

/**
 * Builds a friendly cartoon palm tree.
 */
/**
 * Builds an authentic covered pedestrian skywalk crossing above Bund Road
 * connecting the upper city plaza directly down to the riverfront promenade.
 */
function createElevatedWalkwayBridge(zCenter: number): THREE.Group {
  const bridge = new THREE.Group();
  bridge.name = 'upper-bund-elevated-walkway';
  const xBase = getNaturalShorelineX(zCenter);

  const xStart = xBase + 12.0;
  const xEnd = xBase + 46.0;
  const bridgeLength = xEnd - xStart;
  const xMid = (xStart + xEnd) / 2;
  const deckY = 5.2; // 5.2m overhead clearance above road

  // Structural Bridge Deck (4.2m width)
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeLength, 0.4, 4.2),
    envMats.pavedPlaza
  );
  deck.position.set(xMid, deckY, zCenter);
  deck.receiveShadow = true;
  bridge.add(deck);

  // Deck Lower Steel Girder
  const girder = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeLength, 0.5, 3.8),
    envMats.skywalkSteel
  );
  girder.position.set(xMid, deckY - 0.4, zCenter);
  bridge.add(girder);

  // Concrete Support Piers
  const pierGeo = new THREE.CylinderGeometry(0.5, 0.6, deckY, 12);
  for (const px of [xStart + 3.0, xMid, xEnd - 3.0]) {
    for (const pz of [zCenter - 1.5, zCenter + 1.5]) {
      const pier = new THREE.Mesh(pierGeo, envMats.skywalkWhite);
      pier.position.set(px, deckY / 2, pz);
      pier.castShadow = true;
      bridge.add(pier);
    }
  }

  // Arched Glass Canopy with Steel Trusses
  const canopyGeo = new THREE.CylinderGeometry(2.4, 2.4, bridgeLength, 16, 1, false, 0, Math.PI);
  const canopy = new THREE.Mesh(canopyGeo, envMats.skywalkGlass);
  canopy.rotation.z = Math.PI / 2;
  canopy.position.set(xMid, deckY + 1.5, zCenter);
  bridge.add(canopy);

  // Steel Arch Ribs along the bridge
  for (let x = xStart + 1.0; x <= xEnd - 1.0; x += 4.0) {
    const archGeo = new THREE.TorusGeometry(2.45, 0.08, 6, 16, Math.PI);
    const arch = new THREE.Mesh(archGeo, envMats.skywalkSteel);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(x, deckY + 1.5, zCenter);
    bridge.add(arch);
  }

  // Safety Glass Railings on sides
  for (const rz of [zCenter - 2.0, zCenter + 2.0]) {
    const railing = new THREE.Mesh(
      new THREE.BoxGeometry(bridgeLength, 1.2, 0.1),
      envMats.skywalkGlass
    );
    railing.position.set(xMid, deckY + 0.8, rz);
    bridge.add(railing);
  }

  // Descending Pedestrian Stair Ramps at Both Ends
  const stairSteps = 10;
  for (let s = 0; s < stairSteps; s++) {
    const t = s / stairSteps;
    const stepW = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.35, 3.8),
      envMats.pavedPlaza
    );
    stepW.position.set(xStart - s * 1.0, deckY * (1 - t) + 0.2, zCenter);
    bridge.add(stepW);

    const stepE = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.35, 3.8),
      envMats.pavedPlaza
    );
    stepE.position.set(xEnd + s * 1.0, deckY * (1 - t) + 0.2, zCenter);
    bridge.add(stepE);
  }

  // Overhead Identification Signboard (Prominent Landmark Pill Badge - Phase 2)
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
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 54);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Crisp White Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Left Icon Circle
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
    ctx.fillText('🚶', 64, 65);

    // Label Text
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Upper Bund Elevated Walkway', 118, 65);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(8.5, 2.0, 1);
  sprite.position.set(xMid, deckY + 5.0, zCenter);
  bridge.add(sprite);

  return bridge;
}

function createCartoonPalmTree(x: number, z: number, scale = 1.0): THREE.Group {
  const tree = new THREE.Group();
  tree.position.set(x, 0.22, z);
  tree.scale.set(scale, scale, scale);

  // Segmented curved trunk
  const segments = 5;
  for (let i = 0; i < segments; i++) {
    const rTop = 0.35 - i * 0.04;
    const rBot = 0.42 - i * 0.04;
    const segGeo = new THREE.CylinderGeometry(rTop, rBot, 1.1, 8);
    const seg = new THREE.Mesh(segGeo, envMats.palmTrunk);
    seg.position.set(Math.sin(i * 0.3) * 0.25, 0.55 + i * 1.0, 0);
    seg.rotation.z = -i * 0.05;
    tree.add(seg);
  }

  // Crown Fronds
  const frondCount = 7;
  const topY = 0.55 + segments * 1.0;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const frondGeo = new THREE.BoxGeometry(0.4, 0.08, 2.8);
    const frond = new THREE.Mesh(frondGeo, envMats.palmLeaves);
    frond.position.set(
      Math.sin(angle) * 1.2,
      topY - 0.2,
      Math.cos(angle) * 1.2
    );
    frond.rotation.y = angle;
    frond.rotation.x = 0.45;
    tree.add(frond);
  }

  // Coconuts cluster
  const nutGeo = new THREE.SphereGeometry(0.22, 8, 8);
  for (let i = 0; i < 3; i++) {
    const nut = new THREE.Mesh(nutGeo, envMats.palmTrunk);
    nut.position.set(Math.cos(i * 2.1) * 0.3, topY - 0.15, Math.sin(i * 2.1) * 0.3);
    tree.add(nut);
  }

  return tree;
}

/**
 * Builds a friendly cartoon heritage street lamppost.
 */
function createCartoonLamppost(x: number, z: number): THREE.Group {
  const lamp = new THREE.Group();
  lamp.position.set(x, 0.22, z);

  // Base plinth
  const baseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 8);
  const base = new THREE.Mesh(baseGeo, envMats.lampPost);
  base.position.y = 0.2;
  lamp.add(base);

  // Tall fluted column
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.14, 4.2, 8);
  const pole = new THREE.Mesh(poleGeo, envMats.lampPost);
  pole.position.y = 2.4;
  lamp.add(pole);

  // Ornate crossbar
  const barGeo = new THREE.BoxGeometry(1.6, 0.12, 0.12);
  const bar = new THREE.Mesh(barGeo, envMats.lampPost);
  bar.position.y = 4.3;
  lamp.add(bar);

  // Two glowing lantern globes
  const globeGeo = new THREE.SphereGeometry(0.32, 10, 10);
  for (const gx of [-0.75, 0.75]) {
    const globe = new THREE.Mesh(globeGeo, envMats.lampGlow);
    globe.position.set(gx, 4.15, 0);
    lamp.add(globe);

    // Lantern cap
    const capGeo = new THREE.ConeGeometry(0.4, 0.25, 6);
    const cap = new THREE.Mesh(capGeo, envMats.lampPost);
    cap.position.set(gx, 4.5, 0);
    lamp.add(cap);
  }

  return lamp;
}

/**
 * Builds the complete Phase 1 river, shoreline, stepped ghats and dry-land environment.
 */
export function buildCartoonEnvironment(scene: THREE.Scene): CartoonEnvironmentController {
  const envGroup = new THREE.Group();
  envGroup.name = 'cartoon-riverfront-environment';
  scene.add(envGroup);

  const zMin = -160;
  const zMax = 160;
  const zSteps = 40;

  // 1. Animated Curved Godavari River (West of the shoreline)
  // Water edge is strictly xShore(z) - 8.5
  const riverGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    () => -160,
    (z) => getNaturalShorelineX(z) - 8.5,
    -0.32,
    14
  );
  const riverMesh = new THREE.Mesh(riverGeo, envMats.riverBase);
  riverMesh.receiveShadow = true;
  envGroup.add(riverMesh);

  // Wave ripple overlay ribbon
  const waveGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    () => -160,
    (z) => getNaturalShorelineX(z) - 8.5,
    -0.28,
    10
  );
  const waveOverlay = new THREE.Mesh(waveGeo, envMats.riverWaves);
  envGroup.add(waveOverlay);

  // Shoreline white foam ribbon right along the water edge
  const foamGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z) - 10.2,
    (z) => getNaturalShorelineX(z) - 7.6,
    -0.26,
    1
  );
  const foamRibbon = new THREE.Mesh(foamGeo, envMats.shoreFoam);
  envGroup.add(foamRibbon);

  // 2. Cascading Stepped Stone Ghat Embankment (Descending into water)
  // 4 tiered stone steps connecting water edge (xShore - 8.5) up to promenade (xShore)
  const tierConfigs = [
    { x0: -8.5, x1: -6.4, y: -0.18, mat: envMats.promenadeBorder },
    { x0: -6.4, x1: -4.3, y: -0.05, mat: envMats.riverwalkStone },
    { x0: -4.3, x1: -2.1, y: 0.08, mat: envMats.promenadeBorder },
    { x0: -2.1, x1: 0.0, y: 0.20, mat: envMats.riverwalkStone },
  ];

  tierConfigs.forEach((tier) => {
    const tierGeo = createRibbonGeometry(
      zMin,
      zMax,
      zSteps,
      (z) => getNaturalShorelineX(z) + tier.x0,
      (z) => getNaturalShorelineX(z) + tier.x1,
      tier.y,
      1
    );
    const tierMesh = new THREE.Mesh(tierGeo, tier.mat);
    tierMesh.receiveShadow = true;
    envGroup.add(tierMesh);
  });

  // 3. Main Riverbank Sandstone Promenade (Walkway between xShore and xShore + 16)
  const promenadeGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z),
    (z) => getNaturalShorelineX(z) + 16.0,
    0.22,
    2
  );
  const promenade = new THREE.Mesh(promenadeGeo, envMats.riverwalkStone);
  promenade.receiveShadow = true;
  envGroup.add(promenade);

  // Sandstone Promenade Edging Borders
  const borderWestGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z) - 0.4,
    (z) => getNaturalShorelineX(z) + 0.4,
    0.24,
    1
  );
  const borderWest = new THREE.Mesh(borderWestGeo, envMats.promenadeBorder);
  envGroup.add(borderWest);

  const borderEastGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z) + 15.6,
    (z) => getNaturalShorelineX(z) + 16.4,
    0.24,
    1
  );
  const borderEast = new THREE.Mesh(borderEastGeo, envMats.promenadeBorder);
  envGroup.add(borderEast);

  // 4. Ornamental Riverside Brass Balustrade & Safety Stanchions
  const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.1, 8);
  const ballGeo = new THREE.SphereGeometry(0.16, 8, 8);

  for (let z = -150; z <= 150; z += 10) {
    const xEdge = getNaturalShorelineX(z) + 0.2;
    const post = new THREE.Mesh(postGeo, envMats.brassPost);
    post.position.set(xEdge, 0.75, z);
    envGroup.add(post);

    const ball = new THREE.Mesh(ballGeo, envMats.brassPost);
    ball.position.set(xEdge, 1.35, z);
    envGroup.add(ball);
  }

  // Balustrade continuous top rail
  const railCurvePoints: THREE.Vector3[] = [];
  for (let z = -150; z <= 150; z += 5) {
    railCurvePoints.push(new THREE.Vector3(getNaturalShorelineX(z) + 0.2, 1.25, z));
  }
  const railCurve = new THREE.CatmullRomCurve3(railCurvePoints);
  const railGeo = new THREE.TubeGeometry(railCurve, 60, 0.06, 6, false);
  const railMesh = new THREE.Mesh(railGeo, envMats.brassPost);
  envGroup.add(railMesh);

  // 5. Dry Land Base (East of the Promenade up to +180)
  const dryLandGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z) + 16.0,
    () => 180.0,
    0.20,
    8
  );
  const dryLandMesh = new THREE.Mesh(dryLandGeo, envMats.groundGrass);
  dryLandMesh.receiveShadow = true;
  envGroup.add(dryLandMesh);

  // 6. Bund Road Arterial (Dark Asphalt with White Markings)
  // Spans from xShore(z) + 26.0 to xShore(z) + 42.0 (width 16 units)
  const roadGeo = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z) + 26.0,
    (z) => getNaturalShorelineX(z) + 42.0,
    0.24,
    2
  );
  const roadMesh = new THREE.Mesh(roadGeo, envMats.bundRoad);
  roadMesh.receiveShadow = true;
  envGroup.add(roadMesh);

  // Center dashed road markings
  for (let z = -145; z <= 145; z += 8.0) {
    const xCenter = getNaturalShorelineX(z) + 34.0;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 4.0), envMats.roadMarking);
    dash.position.set(xCenter, 0.27, z);
    envGroup.add(dash);
  }

  // Road edge solid lines
  const edgeLineL = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z) + 26.3,
    (z) => getNaturalShorelineX(z) + 26.7,
    0.26,
    1
  );
  envGroup.add(new THREE.Mesh(edgeLineL, envMats.roadMarking));

  const edgeLineR = createRibbonGeometry(
    zMin,
    zMax,
    zSteps,
    (z) => getNaturalShorelineX(z) + 41.3,
    (z) => getNaturalShorelineX(z) + 41.7,
    0.26,
    1
  );
  envGroup.add(new THREE.Mesh(edgeLineR, envMats.roadMarking));

  // Pedestrian Zebra Crosswalks connecting Bund Road to Promenade
  const crosswalkPositions = [-100, -35, 25, 95];
  crosswalkPositions.forEach((cz) => {
    const xBase = getNaturalShorelineX(cz);
    for (let i = 27; i <= 41; i += 1.8) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 6.0), envMats.crosswalkWhite);
      stripe.position.set(xBase + i, 0.28, cz);
      envGroup.add(stripe);
    }

    // Paved connection avenue from road to promenade
    const ave = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.04, 12.0), envMats.pavedPlaza);
    ave.position.set(xBase + 21.0, 0.23, cz);
    envGroup.add(ave);
  });

  // 6b. Upper Bund Elevated Walkway Bridge (Covered Pedestrian Skywalk Crossing Bund Road)
  const skywalkBridge = createElevatedWalkwayBridge(20.0);
  envGroup.add(skywalkBridge);

  // 7. Cartoon Palm Trees along the Riverwalk & Road Buffer
  for (let z = -140; z <= 140; z += 24) {
    const xP1 = getNaturalShorelineX(z) + 1.8;
    const palmW = createCartoonPalmTree(xP1, z, 0.95);
    envGroup.add(palmW);

    const xP2 = getNaturalShorelineX(z + 12) + 44.0;
    const palmE = createCartoonPalmTree(xP2, z + 12, 1.05);
    envGroup.add(palmE);
  }

  // 8. Heritage Cartoon Lampposts along the Riverwalk
  for (let z = -140; z <= 140; z += 20) {
    const xLamp = getNaturalShorelineX(z) + 14.5;
    const lamp = createCartoonLamppost(xLamp, z);
    envGroup.add(lamp);
  }

  // 9. Floating Ceremonial Pilgrim Boats (Strictly in open water)
  const boats: THREE.Group[] = [];
  const boatCoords = [
    { x: getNaturalShorelineX(-55) - 30, z: -55, r: 0.15 },
    { x: getNaturalShorelineX(-20) - 26, z: -20, r: -0.2 },
    { x: getNaturalShorelineX(15) - 28, z: 15, r: 0.1 },
    { x: getNaturalShorelineX(45) - 25, z: 45, r: -0.25 },
    { x: getNaturalShorelineX(75) - 32, z: 75, r: 0.05 },
  ];

  boatCoords.forEach((bc) => {
    const boat = createCartoonBoat(bc.x, bc.z, bc.r);
    envGroup.add(boat);
    boats.push(boat);
  });

  return {
    group: envGroup,
    waterMesh: riverMesh,
    foamRibbon,
    boats,
    update: (time: number, _delta: number) => {
      // 1. Dynamic Water Wave Ripple Animation
      const posAttr = riverMesh.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const vx = posAttr.getX(i);
        const vz = posAttr.getZ(i);
        const wave =
          Math.sin(time * 2.2 + vx * 0.08 + vz * 0.06) * 0.15 +
          Math.cos(time * 1.5 + vz * 0.1) * 0.08;
        posAttr.setY(i, -0.32 + wave);
      }
      posAttr.needsUpdate = true;

      // Wave overlay opacity pulsation
      (waveOverlay.material as THREE.Material).opacity = 0.35 + 0.15 * Math.sin(time * 3.0);

      // Shoreline foam pulsing
      (foamRibbon.material as THREE.Material).opacity = 0.55 + 0.25 * Math.cos(time * 2.5);

      // 2. Ceremonial Boats Bobbing & Tilting with Water Waves
      boats.forEach((boat, idx) => {
        const phase = time * 1.8 + idx * 1.2;
        boat.position.y = -0.15 + Math.sin(phase) * 0.14;
        boat.rotation.z = Math.sin(phase * 0.9) * 0.05;
        boat.rotation.x = Math.cos(phase * 0.8) * 0.03;
      });
    },
  };
}
