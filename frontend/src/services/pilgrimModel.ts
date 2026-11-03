import * as THREE from 'three';
import { UserLocation } from '../types';

/**
 * Procedural 3D Cartoon Pilgrim Character for Godavari SmartMap 2027.
 * Designed with stylized cartoon proportions, traditional festival-appropriate
 * attire (kurta, dhoti, sacred saffron angavastram, and pilgrim headcloth),
 * optimized for lightweight WebGL rendering on mobile and desktop browsers.
 */

export interface PilgrimController {
  group: THREE.Group;
  characterRoot: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  pulseRing: THREE.Mesh;
  baseDisc: THREE.Mesh;
  badgeMesh: THREE.Sprite;
  update: (
    location: UserLocation | null,
    targetWorldPos: THREE.Vector3,
    clockTime: number,
    delta: number
  ) => void;
}

// Lightweight shared materials
const pilgrimMaterials = {
  skin: new THREE.MeshLambertMaterial({ color: 0xffdfba }), // Warm cartoon peach
  kurta: new THREE.MeshLambertMaterial({ color: 0xf8fafc }), // Pure festive white
  angavastram: new THREE.MeshLambertMaterial({ color: 0xf97316 }), // Sacred saffron orange
  dhoti: new THREE.MeshLambertMaterial({ color: 0xffedd5 }), // Cream ivory dhoti
  dhotiBorder: new THREE.MeshLambertMaterial({ color: 0xd97706 }), // Golden border
  turban: new THREE.MeshLambertMaterial({ color: 0xea580c }), // Festive saffron headcloth
  brassVessel: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.7,
    roughness: 0.25,
  }), // Brass Kamandalu
  eyes: new THREE.MeshBasicMaterial({ color: 0x0f172a }), // Dark eyes
  tilakam: new THREE.MeshBasicMaterial({ color: 0xdc2626 }), // Red vermilion tilakam
  sandals: new THREE.MeshLambertMaterial({ color: 0x78350f }), // Leather sandals
  liveGpsRing: new THREE.MeshBasicMaterial({
    color: 0x06b6d4, // Cyan
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  }),
  demoRing: new THREE.MeshBasicMaterial({
    color: 0xf59e0b, // Amber
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  }),
};

/**
 * Renders dynamic text sprite billboard for the pilgrim's overhead status badge.
 */
function renderBadgeTexture(
  canvas: HTMLCanvasElement,
  isLiveGps: boolean,
  accuracy?: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, 256, 64);

  // Rounded badge background
  ctx.fillStyle = isLiveGps ? 'rgba(6, 182, 212, 0.95)' : 'rgba(245, 158, 11, 0.95)';
  ctx.beginPath();
  ctx.roundRect(8, 8, 240, 48, 24);
  ctx.fill();

  // Dark outline border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Badge text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isLiveGps) {
    const accStr = accuracy ? ` (±${Math.round(accuracy)}m)` : '';
    ctx.fillText(`YOU • LIVE GPS${accStr}`, 128, 32);
  } else {
    ctx.fillText('START • DEMO PIN', 128, 32);
  }
}

/**
 * Builds the complete 3D cartoon pilgrim character group.
 */
export function createCartoonPilgrim(initialLocation?: UserLocation | null): PilgrimController {
  const group = new THREE.Group();
  group.name = 'cartoon-pilgrim';

  const isLive = initialLocation?.source === 'live_gps';

  // 1. Ground Indicator: Pulsing Outer Radar Ring
  const pulseRingGeo = new THREE.RingGeometry(2.0, 2.7, 32);
  const pulseRing = new THREE.Mesh(
    pulseRingGeo,
    isLive ? pilgrimMaterials.liveGpsRing : pilgrimMaterials.demoRing
  );
  pulseRing.rotation.x = -Math.PI / 2;
  pulseRing.position.y = 0.08;
  pulseRing.name = 'pulseRing';
  group.add(pulseRing);

  // 2. Inner Directional Base Disc with Forward Arrow Notch
  const baseDiscGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.15, 24);
  const baseDiscMat = new THREE.MeshBasicMaterial({
    color: isLive ? 0x0891b2 : 0xd97706,
    transparent: true,
    opacity: 0.85,
  });
  const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat);
  baseDisc.position.y = 0.08;
  group.add(baseDisc);

  // Direction pointer arrow on ground
  const arrowGeo = new THREE.ConeGeometry(0.45, 0.9, 3);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const arrow = new THREE.Mesh(arrowGeo, arrowMat);
  arrow.rotation.x = -Math.PI / 2;
  arrow.rotation.z = Math.PI; // Point forward (-Z)
  arrow.position.set(0, 0.17, -1.1);
  group.add(arrow);

  // 3. Human Character Model Root (Allows independent rotation & idle/walk bob)
  const characterRoot = new THREE.Group();
  characterRoot.position.y = 0.15;
  characterRoot.rotation.y = Math.PI * 0.88; // Face towards isometric camera by default
  group.add(characterRoot);

  // --- LOWER BODY: Dhoti & Legs ---
  // Left Leg Pivot
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.35, 1.3, 0);
  characterRoot.add(leftLeg);

  const legGeo = new THREE.CylinderGeometry(0.2, 0.18, 1.3, 10);
  const legMeshL = new THREE.Mesh(legGeo, pilgrimMaterials.dhoti);
  legMeshL.position.y = -0.65;
  leftLeg.add(legMeshL);

  const sandalL = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.12, 0.55),
    pilgrimMaterials.sandals
  );
  sandalL.position.set(0, -1.28, -0.05);
  leftLeg.add(sandalL);

  // Right Leg Pivot
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.35, 1.3, 0);
  characterRoot.add(rightLeg);

  const legMeshR = new THREE.Mesh(legGeo, pilgrimMaterials.dhoti);
  legMeshR.position.y = -0.65;
  rightLeg.add(legMeshR);

  const sandalR = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.12, 0.55),
    pilgrimMaterials.sandals
  );
  sandalR.position.set(0, -1.28, -0.05);
  rightLeg.add(sandalR);

  // Dhoti Lower Skirt / Draped Wrap
  const dhotiWrapGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.0, 14);
  const dhotiWrap = new THREE.Mesh(dhotiWrapGeo, pilgrimMaterials.dhoti);
  dhotiWrap.position.y = 1.35;
  characterRoot.add(dhotiWrap);

  // Golden Dhoti Hem Border
  const dhotiHemGeo = new THREE.TorusGeometry(0.66, 0.05, 8, 16);
  const dhotiHem = new THREE.Mesh(dhotiHemGeo, pilgrimMaterials.dhotiBorder);
  dhotiHem.rotation.x = Math.PI / 2;
  dhotiHem.position.y = 0.88;
  characterRoot.add(dhotiHem);

  // --- TORSO: Traditional Kurta & Angavastram ---
  const torsoGeo = new THREE.CylinderGeometry(0.5, 0.52, 1.25, 14);
  const torso = new THREE.Mesh(torsoGeo, pilgrimMaterials.kurta);
  torso.position.y = 2.15;
  characterRoot.add(torso);

  // Sacred Angavastram (diagonal saffron shawl draped across left shoulder)
  const sashGeo = new THREE.TorusGeometry(0.55, 0.08, 8, 16);
  const sash = new THREE.Mesh(sashGeo, pilgrimMaterials.angavastram);
  sash.rotation.z = Math.PI / 4;
  sash.rotation.x = Math.PI / 10;
  sash.position.set(-0.02, 2.2, 0);
  characterRoot.add(sash);

  // Angavastram hanging end flap
  const sashFlap = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.9, 0.06),
    pilgrimMaterials.angavastram
  );
  sashFlap.position.set(-0.45, 1.7, 0.2);
  sashFlap.rotation.z = -0.15;
  characterRoot.add(sashFlap);

  // --- ARMS ---
  // Left Arm (Gentle walking / balance pose)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.65, 2.6, 0);
  characterRoot.add(leftArm);

  const armGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.9, 8);
  const armL = new THREE.Mesh(armGeo, pilgrimMaterials.kurta);
  armL.position.y = -0.45;
  leftArm.add(armL);

  const handL = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 8, 8),
    pilgrimMaterials.skin
  );
  handL.position.y = -0.92;
  leftArm.add(handL);

  // Right Arm (Holding sacred brass Kamandalu holy water vessel)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.65, 2.6, 0);
  characterRoot.add(rightArm);

  const armR = new THREE.Mesh(armGeo, pilgrimMaterials.kurta);
  armR.position.y = -0.45;
  rightArm.add(armR);

  const handR = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 8, 8),
    pilgrimMaterials.skin
  );
  handR.position.y = -0.92;
  rightArm.add(handR);

  // Brass Kamandalu (Holy Godavari Water Vessel)
  const vesselGroup = new THREE.Group();
  vesselGroup.position.set(0, -1.15, -0.1);

  const potGeo = new THREE.SphereGeometry(0.24, 12, 10);
  const pot = new THREE.Mesh(potGeo, pilgrimMaterials.brassVessel);
  vesselGroup.add(pot);

  const neckGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.22, 8);
  const neck = new THREE.Mesh(neckGeo, pilgrimMaterials.brassVessel);
  neck.position.y = 0.2;
  vesselGroup.add(neck);

  const rimGeo = new THREE.TorusGeometry(0.1, 0.03, 6, 12);
  const rim = new THREE.Mesh(rimGeo, pilgrimMaterials.brassVessel);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.31;
  vesselGroup.add(rim);

  const handleGeo = new THREE.TorusGeometry(0.18, 0.025, 6, 12, Math.PI);
  const handle = new THREE.Mesh(handleGeo, pilgrimMaterials.brassVessel);
  handle.rotation.z = Math.PI;
  handle.position.y = 0.28;
  vesselGroup.add(handle);

  rightArm.add(vesselGroup);

  // --- HEAD & TURBAN ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 3.15, 0);
  characterRoot.add(headGroup);

  // Stylized cartoon head sphere
  const headGeo = new THREE.SphereGeometry(0.48, 16, 14);
  const headMesh = new THREE.Mesh(headGeo, pilgrimMaterials.skin);
  headGroup.add(headMesh);

  // Big friendly cartoon eyes
  const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeo, pilgrimMaterials.eyes);
  eyeL.position.set(-0.16, 0.05, -0.42);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, pilgrimMaterials.eyes);
  eyeR.position.set(0.16, 0.05, -0.42);
  headGroup.add(eyeR);

  // Eye catchlights (sparkle)
  const sparkleGeo = new THREE.SphereGeometry(0.025, 4, 4);
  const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const spL = new THREE.Mesh(sparkleGeo, sparkleMat);
  spL.position.set(-0.14, 0.08, -0.47);
  headGroup.add(spL);

  const spR = new THREE.Mesh(sparkleGeo, sparkleMat);
  spR.position.set(0.18, 0.08, -0.47);
  headGroup.add(spR);

  // Red Vermilion Tilakam / Bindi on Forehead
  const tilakGeo = new THREE.BoxGeometry(0.06, 0.16, 0.02);
  const tilak = new THREE.Mesh(tilakGeo, pilgrimMaterials.tilakam);
  tilak.position.set(0, 0.2, -0.46);
  headGroup.add(tilak);

  // Saffron Pilgrim Turban / Headcloth
  const turbanBaseGeo = new THREE.TorusGeometry(0.46, 0.14, 10, 20);
  const turbanBase = new THREE.Mesh(turbanBaseGeo, pilgrimMaterials.turban);
  turbanBase.rotation.x = Math.PI / 2;
  turbanBase.position.y = 0.22;
  headGroup.add(turbanBase);

  // Turban Upper Dome
  const turbanDomeGeo = new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const turbanDome = new THREE.Mesh(turbanDomeGeo, pilgrimMaterials.turban);
  turbanDome.position.y = 0.22;
  headGroup.add(turbanDome);

  // Turban Decorative Fold Brooch / Feather Pin
  const broochGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const brooch = new THREE.Mesh(broochGeo, pilgrimMaterials.brassVessel);
  brooch.position.set(0, 0.38, -0.45);
  headGroup.add(brooch);

  // Draped Turban Cloth Trail
  const turbanTail = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.55, 0.05),
    pilgrimMaterials.turban
  );
  turbanTail.position.set(0.3, 0.05, 0.42);
  turbanTail.rotation.x = -0.2;
  headGroup.add(turbanTail);

  // 4. Overhead Floating Status Badge
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 256;
  badgeCanvas.height = 64;
  renderBadgeTexture(badgeCanvas, isLive, initialLocation?.accuracy);

  const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
  badgeTexture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: badgeTexture,
    transparent: true,
    depthTest: false,
  });
  const badgeMesh = new THREE.Sprite(spriteMat);
  badgeMesh.scale.set(6.5, 1.6, 1);
  badgeMesh.position.set(0, 5.2, 0);
  group.add(badgeMesh);

  // Track state for dynamic badge & walk-cycle
  let isMoving = false;
  let lastIsLive = isLive;
  let lastAccuracy = initialLocation?.accuracy ? Math.round(initialLocation.accuracy) : 0;

  const controller: PilgrimController = {
    group,
    characterRoot,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    pulseRing,
    baseDisc,
    badgeMesh,
    update: (
      location: UserLocation | null,
      targetWorldPos: THREE.Vector3,
      clockTime: number,
      delta: number
    ) => {
      // 1. Smooth Position Interpolation (Lerp) to prevent GPS snapping
      const dist = group.position.distanceTo(targetWorldPos);
      isMoving = dist > 0.06;

      group.position.lerp(targetWorldPos, Math.min(1.0, delta * 7.5));

      // 2. Heading / Rotation Handling
      if (location && location.heading != null && !isNaN(location.heading)) {
        // Real compass heading (converted from degrees to radians)
        const targetRad = THREE.MathUtils.degToRad(-location.heading);
        characterRoot.rotation.y = THREE.MathUtils.lerp(characterRoot.rotation.y, targetRad, delta * 6);
      } else if (isMoving) {
        // Face direction of movement
        const moveVec = new THREE.Vector3().subVectors(targetWorldPos, group.position);
        if (moveVec.lengthSq() > 0.001) {
          const targetAngle = Math.atan2(moveVec.x, moveVec.z);
          characterRoot.rotation.y = THREE.MathUtils.lerp(characterRoot.rotation.y, targetAngle, delta * 8);
        }
      }

      // 3. Subtle Walking vs Idle Animation
      if (isMoving) {
        // Natural swing when walking
        const swing = Math.sin(clockTime * 9.0) * 0.45;
        leftArm.rotation.x = swing;
        rightArm.rotation.x = -swing * 0.7; // Right arm carrying vessel swings gently
        leftLeg.rotation.x = -swing;
        rightLeg.rotation.x = swing;
        // Walking vertical bob
        characterRoot.position.y = 0.15 + Math.abs(Math.sin(clockTime * 9.0)) * 0.12;
      } else {
        // Gentle idle breathing sway
        const idleBreathe = Math.sin(clockTime * 2.2) * 0.04;
        leftArm.rotation.x = idleBreathe * 0.5;
        rightArm.rotation.x = -idleBreathe * 0.3;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        characterRoot.position.y = 0.15 + idleBreathe * 0.5;
      }

      // 4. Ground Radar Pulse Animation
      const pulseCycle = (clockTime * 2.0) % 1.0;
      const pulseScale = 1.0 + pulseCycle * 0.7;
      pulseRing.scale.set(pulseScale, pulseScale, 1);
      (pulseRing.material as THREE.Material).opacity = Math.max(0, 0.85 * (1.0 - pulseCycle));

      // 5. Update Status Appearance (Live GPS vs Demo Selection)
      const currentIsLive = location?.source === 'live_gps';
      const currentAccuracy = location?.accuracy ? Math.round(location.accuracy) : 0;
      if (currentIsLive !== lastIsLive || currentAccuracy !== lastAccuracy) {
        lastIsLive = currentIsLive;
        lastAccuracy = currentAccuracy;
        renderBadgeTexture(badgeCanvas, currentIsLive, location?.accuracy);
        badgeTexture.needsUpdate = true;
      }
      pulseRing.material = currentIsLive ? pilgrimMaterials.liveGpsRing : pilgrimMaterials.demoRing;
      (baseDisc.material as THREE.MeshBasicMaterial).color.setHex(currentIsLive ? 0x0891b2 : 0xd97706);
    },
  };

  group.visible = false;
  return controller;
}
