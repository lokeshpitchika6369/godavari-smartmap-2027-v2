import React, { useEffect, useRef, useState, useMemo } from 'react';

import * as THREE from 'three';

import { MapControls as ThreeMapControls } from 'three/examples/jsm/controls/MapControls.js';

import { Facility, Language, UserLocation, GeolocationStatus, NavigationRoute, CrowdDensityZone } from '../../types';

import { FACILITIES_DATA, GODAVARI_RIVERFRONT_CENTER } from '../../data/facilitiesData';

import { createFacility3DModel } from '../../services/threeTemplates';

import { createCartoonPilgrim, PilgrimController } from '../../services/pilgrimModel';

import { buildCartoonEnvironment, CartoonEnvironmentController } from '../../services/cartoonEnvironment';

import { translations } from '../../i18n/translations';

import { MapControls as MapControlsToolbar } from './MapControls';

import { FacilityDetailModal } from './FacilityDetailModal';

import { Search, Info, Navigation } from 'lucide-react';



interface Interactive3DMapProps {

  currentLanguage: Language;

  selectedFacility: Facility | null;

  onSelectFacility: (facility: Facility | null) => void;

  activeCategoryFilter: string;

  onCategoryFilterChange: (cat: string) => void;

  searchQuery: string;

  onSearchChange: (q: string) => void;

  userLocation: UserLocation | null;

  geolocationStatus: GeolocationStatus;

  onRequestLocation: () => void;

  onOpenQrScanner: () => void;

  activeRoute: NavigationRoute | null;

  onStartRoute: (facility: Facility) => void;

  onViewQrCode: (facility: Facility) => void;

  onOpenCrowdReport?: () => void;

  showCrowdHeatmap?: boolean;

  crowdZones?: CrowdDensityZone[];

  routeOverviewTrigger?: number;

  recenterTrigger?: number;

  isFollowingUser?: boolean;

  onToggleFollowUser?: (following: boolean) => void;

}



// Convert real geographical [lat, lng] to local Three.js coordinates [x, y, z]

export function geoTo3D(coords: [number, number]): { x: number; y: number; z: number } {

  const [lat, lng] = coords;

  const [centerLng, centerLat] = GODAVARI_RIVERFRONT_CENTER;

  // 1 degree longitude ≈ 106,300m; 1 degree latitude ≈ 111,000m

  // Scale factor: 1 Three.js unit = 10 meters

  const x = (lng - centerLng) * 10630;

  const z = -(lat - centerLat) * 11100;

  return { x, y: 0.22, z };

}



// Helper: Draw rounded rectangle on canvas

// Helper: Checks if segment between p0 and p1 intersects an AABB box
function segmentIntersectsBox(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  box: THREE.Box3
): boolean {
  const dir = new THREE.Vector3().subVectors(p1, p0);
  const len = dir.length();
  if (len < 0.001) return false;
  dir.normalize();
  const ray = new THREE.Ray(p0, dir);
  const hit = new THREE.Vector3();
  if (ray.intersectBox(box, hit)) {
    const dist = hit.distanceTo(p0);
    return dist >= 0.05 && dist <= len - 0.05;
  }
  return false;
}

// Helper: Detects whether any facility building obstructs the sightline between p0 and p1
function detectFacilityObstruction(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  modelsMap?: Map<string, THREE.Group>
): { hasObstacle: boolean; obstacleId?: string } {
  if (!modelsMap || modelsMap.size === 0) return { hasObstacle: false };

  for (const [id, model] of modelsMap.entries()) {
    if (!model.visible) continue;
    // Fast distance culling (only check facilities within 45m)
    const dx = model.position.x - p0.x;
    const dz = model.position.z - p0.z;
    if (dx * dx + dz * dz > 2025) continue; // 45^2 = 2025

    if (!model.userData.visualBoxes) {
      model.updateMatrixWorld(true);
      const boxes: THREE.Box3[] = [];
      model.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          !child.name.startsWith('hitbox') &&
          !child.name.startsWith('anchor')
        ) {
          if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
          const gb = child.geometry.boundingBox;
          if (gb) {
            const height = gb.max.y - gb.min.y;
            // Exclude flat ground base locator discs (e.g. anchor disc with height 0.18 at y=0.09)
            if (height < 0.25 && child.position.y < 0.2) return;
          }
          const b = child.geometry.boundingBox.clone().applyMatrix4(child.matrixWorld);
          if (!b.isEmpty()) {
            boxes.push(b);
          }
        }
      });
      model.userData.visualBoxes = boxes;
    }

    const boxes = model.userData.visualBoxes as THREE.Box3[];
    if (boxes && boxes.length > 0) {
      for (const box of boxes) {
        if (segmentIntersectsBox(p0, p1, box)) {
          return { hasObstacle: true, obstacleId: id };
        }
      }
    }
  }

  return { hasObstacle: false };
}

/**
 * Computes route-aware third-person walking camera transform (Investigation V3).
 * - Follow distance: ~14m behind avatar.
 * - Camera height: ~11m above avatar.
 * - Look ahead: ~22m along active route tangent.
 * - Dynamic collision-aware lateral offset towards open river corridor when obstructed.
 * - Preserves desktop behavior (34m distance, 50m height, 18m look-ahead, 0 offset).
 */
function computeNavCameraTransform(
  userPos3D: { x: number; y: number; z: number },
  headingDeg: number | null | undefined,
  pathCoordinates: [number, number][] | undefined,
  isMobile: boolean,
  modelsMap?: Map<string, THREE.Group>,
  currentLateralOffset = 0
): {
  camPos: THREE.Vector3;
  target: THREE.Vector3;
  targetLateralOffset: number;
  detectedObstacleId: string | null;
} {
  // Desktop camera behavior preserved completely
  if (!isMobile) {
    const followDist = 34;
    const followHeight = 50;
    const lookAheadDist = 18;

    let dirX = 0;
    let dirZ = -1;

    // 1. Primary: During active navigation, ALWAYS use route corridor tangent as the camera direction
    // to follow the true walking path ahead, preventing unreliable/stationary compass heading (0° North).
    if (pathCoordinates && pathCoordinates.length >= 2) {
      const pts = pathCoordinates.map((c) => geoTo3D(c));
      const lastP = pts[pts.length - 1];
      const dx = lastP.x - userPos3D.x;
      const dz = lastP.z - userPos3D.z;
      const dist = Math.hypot(dx, dz);
      if (dist >= 0.2) {
        dirX = dx / dist;
        dirZ = dz / dist;
      }
    }

    const target = new THREE.Vector3(
      userPos3D.x + dirX * lookAheadDist,
      0,
      userPos3D.z + dirZ * lookAheadDist
    );
    const camPos = new THREE.Vector3(
      userPos3D.x - dirX * followDist,
      followHeight,
      userPos3D.z - dirZ * followDist
    );

    return { camPos, target, targetLateralOffset: 0, detectedObstacleId: null };
  }

  // --- MOBILE THIRD-PERSON WALKING CAMERA ---
  const followDist = 14.0;
  const camHeight = 11.0;
  const lookAheadDist = 22.0;

  let dirX = 0;
  let dirZ = -1; // Default North (-Z)

  if (headingDeg != null && !isNaN(headingDeg)) {
    const rad = THREE.MathUtils.degToRad(headingDeg);
    dirX = Math.sin(rad);
    dirZ = -Math.cos(rad);
  } else if (pathCoordinates && pathCoordinates.length >= 2) {
    const pts = pathCoordinates.map((c) => geoTo3D(c));

    // Find closest segment to userPos3D
    let bestDist = Infinity;
    let bestSegIdx = 0;
    let bestProj = pts[0];

    for (let i = 0; i < pts.length - 1; i++) {
      const pA = pts[i];
      const pB = pts[i + 1];
      const dx = pB.x - pA.x;
      const dz = pB.z - pA.z;
      const l2 = dx * dx + dz * dz;
      let proj = pA;
      if (l2 >= 0.0001) {
        const t = Math.max(0, Math.min(1, ((userPos3D.x - pA.x) * dx + (userPos3D.z - pA.z) * dz) / l2));
        proj = { x: pA.x + t * dx, y: 0.22, z: pA.z + t * dz };
      }
      const d = Math.hypot(userPos3D.x - proj.x, userPos3D.z - proj.z);
      if (d < bestDist) {
        bestDist = d;
        bestSegIdx = i;
        bestProj = proj;
      }
    }

    // Calculate corridor tangent along active route segment
    const pA = pts[bestSegIdx];
    const pB = pts[bestSegIdx + 1];
    const segDx = pB.x - pA.x;
    const segDz = pB.z - pA.z;
    const segLen = Math.hypot(segDx, segDz);
    if (segLen >= 0.01) {
      dirX = segDx / segLen;
      dirZ = segDz / segLen;
    }

    // When approaching a turn (< 5m from waypoint), smoothly blend towards next segment corridor
    const segRem = Math.hypot(pB.x - bestProj.x, pB.z - bestProj.z);
    if (segRem < 5.0 && bestSegIdx + 1 < pts.length - 1) {
      const nextA = pts[bestSegIdx + 1];
      const nextB = pts[bestSegIdx + 2];
      const nDx = nextB.x - nextA.x;
      const nDz = nextB.z - nextA.z;
      const nLen = Math.hypot(nDx, nDz);
      if (nLen >= 0.01) {
        const blend = (5.0 - segRem) / 5.0;
        dirX = dirX * (1 - blend) + (nDx / nLen) * blend;
        dirZ = dirZ * (1 - blend) + (nDz / nLen) * blend;
        const dlen = Math.hypot(dirX, dirZ);
        if (dlen > 0.01) {
          dirX /= dlen;
          dirZ /= dlen;
        }
      }
    } else if (pts.length >= 2) {
      const lastP = pts[pts.length - 1];
      const prevP = pts[pts.length - 2];
      const ldx = lastP.x - prevP.x;
      const ldz = lastP.z - prevP.z;
      const ldist = Math.hypot(ldx, ldz);
      if (ldist >= 0.01) {
        dirX = ldx / ldist;
        dirZ = ldz / ldist;
      }
    }
  } else if (headingDeg != null && !isNaN(headingDeg)) {
    // Fallback: Only use compass heading if no route waypoints exist (e.g. free wandering)
    const rad = THREE.MathUtils.degToRad(headingDeg);
    dirX = Math.sin(rad);
    dirZ = -Math.cos(rad);
  }

  // Look-at target 22m ahead on route tangent
  const target = new THREE.Vector3(
    userPos3D.x + dirX * lookAheadDist,
    0.5,
    userPos3D.z + dirZ * lookAheadDist
  );

  const avatarPosVec = new THREE.Vector3(userPos3D.x, userPos3D.y + 1.2, userPos3D.z);

  // Perpendicular vectors to route corridor tangent
  // Select the lateral offset vector that points towards the open Godavari river / promenade
  const perpA = new THREE.Vector3(-dirZ, 0, dirX);
  const perpB = new THREE.Vector3(dirZ, 0, -dirX);
  let riverPerp = perpA;
  if (Math.abs(dirX) > Math.abs(dirZ)) {
    // Primarily West/East corridor: +Z points towards open riverfront promenade & ghats
    riverPerp = perpA.z > perpB.z ? perpA : perpB;
  } else {
    // Primarily North/South corridor: -X points towards the open Godavari river
    riverPerp = perpA.x < perpB.x ? perpA : perpB;
  }

  // 1. Check un-offset candidate camera position (collinear rear follow, 14m behind)
  const baseCamPos = new THREE.Vector3(
    userPos3D.x - dirX * followDist,
    userPos3D.y + camHeight,
    userPos3D.z - dirZ * followDist
  );

  // Central Main Gate 02 Entrance Corridor Clearance:
  // When starting or walking near Central Main Gate 02 heading Westbound into the festival (dirX < -0.3),
  // a standard collinear rear follow (X ~ 32m) traps the camera behind the 18.5m-wide entrance arch monument.
  // Instead, position the camera inside the open promenade corridor West of the gate (X <= 7.5m),
  // ensuring the gate structure is behind the camera and the forward walking walkway is 100% clear.
  const distToGate02 = Math.hypot(userPos3D.x - 17.96, userPos3D.z - (-3.33));
  if (distToGate02 < 12.0 && dirX < -0.3) {
    baseCamPos.x = Math.min(baseCamPos.x, 7.5);
    baseCamPos.y = Math.max(baseCamPos.y, 11.0);
    baseCamPos.z = -2.5;
  }

  let targetLateralOffset = 0.0;
  let detectedObstacleId: string | null = null;

  if (modelsMap && modelsMap.size > 0) {
    const obsTarget = detectFacilityObstruction(baseCamPos, target, modelsMap);
    const obsAvatar = detectFacilityObstruction(baseCamPos, avatarPosVec, modelsMap);

    if (obsTarget.hasObstacle || obsAvatar.hasObstacle) {
      detectedObstacleId = obsTarget.obstacleId || obsAvatar.obstacleId || null;

      // Dynamically calculate the minimum lateral offset towards the open river corridor
      let foundClear = false;
      for (const candOffset of [3.0, -3.0, 4.5, -4.5, 6.0, -6.0, 7.2, -7.2]) {
        const testCam = new THREE.Vector3(
          baseCamPos.x + riverPerp.x * candOffset,
          baseCamPos.y,
          baseCamPos.z + riverPerp.z * candOffset
        );
        const testObsT = detectFacilityObstruction(testCam, target, modelsMap);
        const testObsA = detectFacilityObstruction(testCam, avatarPosVec, modelsMap);

        if (!testObsT.hasObstacle && !testObsA.hasObstacle) {
          targetLateralOffset = candOffset;
          foundClear = true;
          break;
        }
      }

      if (!foundClear) {
        // Fallback to 7.2m lateral offset if obstacle is wide
        targetLateralOffset = 7.2;
      }
    } else {
      // Clean sightline, no lateral offset needed
      targetLateralOffset = 0.0;
    }
  }

  // Position camera using current smoothly interpolated lateral offset
  const finalCamPos = new THREE.Vector3(
    baseCamPos.x + riverPerp.x * currentLateralOffset,
    baseCamPos.y,
    baseCamPos.z + riverPerp.z * currentLateralOffset
  );

  return {
    camPos: finalCamPos,
    target,
    targetLateralOffset,
    detectedObstacleId,
  };
}

function drawCanvasRoundRect(

  ctx: CanvasRenderingContext2D,

  x: number,

  y: number,

  w: number,

  h: number,

  r: number

) {

  ctx.beginPath();

  ctx.moveTo(x + r, y);

  ctx.lineTo(x + w - r, y);

  ctx.quadraticCurveTo(x + w, y, x + w, y + r);

  ctx.lineTo(x + w, y + h - r);

  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

  ctx.lineTo(x + r, y + h);

  ctx.quadraticCurveTo(x, y + h, x, y + h - r);

  ctx.lineTo(x, y + r);

  ctx.quadraticCurveTo(x, y, x + r, y);

  ctx.closePath();

}



// Helper: Procedural Animated Forward Chevrons Texture

function createRouteChevronTexture(isDetour = false): THREE.CanvasTexture {

  const canvas = document.createElement('canvas');

  canvas.width = 256;

  canvas.height = 64;

  const ctx = canvas.getContext('2d');

  if (ctx) {

    ctx.fillStyle = isDetour ? '#059669' : '#0284c7';

    ctx.fillRect(0, 0, 256, 64);



    ctx.fillStyle = '#ffffff';

    ctx.shadowColor = isDetour ? '#34d399' : '#38bdf8';

    ctx.shadowBlur = 8;



    for (let x = 16; x < 256; x += 48) {

      ctx.beginPath();

      ctx.moveTo(x, 12);

      ctx.lineTo(x + 20, 32);

      ctx.lineTo(x, 52);

      ctx.lineTo(x + 10, 52);

      ctx.lineTo(x + 30, 32);

      ctx.lineTo(x + 10, 12);

      ctx.closePath();

      ctx.fill();

    }

  }



  const texture = new THREE.CanvasTexture(canvas);

  texture.wrapS = THREE.RepeatWrapping;

  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.repeat.set(4, 1);

  return texture;

}



// Helper: 3D Directional Chevron Arrow Mesh

function createChevronMesh(colorHex = 0xffffff): THREE.Mesh {

  const shape = new THREE.Shape();

  shape.moveTo(-0.6, -0.7);

  shape.lineTo(0.0, 0.2);

  shape.lineTo(0.6, -0.7);

  shape.lineTo(0.75, -0.5);

  shape.lineTo(0.0, 0.55);

  shape.lineTo(-0.75, -0.5);

  shape.closePath();



  const geom = new THREE.ShapeGeometry(shape);

  const mat = new THREE.MeshBasicMaterial({

    color: colorHex,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.92,

    depthTest: true,

    depthWrite: false,

  });

  const mesh = new THREE.Mesh(geom, mat);

  mesh.rotation.x = -Math.PI / 2;

  return mesh;

}



// Helper: 3D Start (A) Pin Marker

function createStartPinMarker(): THREE.Group {

  const group = new THREE.Group();

  group.name = 'route-start-pin';



  // Base concentric green ring

  const ringGeo = new THREE.RingGeometry(1.6, 2.2, 32);

  const ringMat = new THREE.MeshBasicMaterial({

    color: 0x10b981,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.85,

  });

  const ring = new THREE.Mesh(ringGeo, ringMat);

  ring.rotation.x = -Math.PI / 2;

  ring.position.y = 0.88;

  group.add(ring);



  // Vertical stem

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });

  const pole = new THREE.Mesh(poleGeo, poleMat);

  pole.position.y = 2.8;

  group.add(pole);



  // Top Sprite Badge

  const canvas = document.createElement('canvas');

  canvas.width = 256;

  canvas.height = 128;

  const ctx = canvas.getContext('2d');

  if (ctx) {

    ctx.fillStyle = '#059669';

    drawCanvasRoundRect(ctx, 8, 8, 240, 112, 24);

    ctx.fill();

    ctx.lineWidth = 6;

    ctx.strokeStyle = '#ffffff';

    ctx.stroke();



    ctx.fillStyle = '#ffffff';

    ctx.font = 'bold 36px Inter, sans-serif';

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillText('START (A)', 128, 64);

  }



  const texture = new THREE.CanvasTexture(canvas);

  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false });

  const sprite = new THREE.Sprite(spriteMat);

  sprite.position.y = 5.2;

  sprite.scale.set(6.5, 3.25, 1);

  group.add(sprite);



  return group;

}



// Helper: 3D Destination (B) Pin Marker

function createDestinationPinMarker(): THREE.Group {

  const group = new THREE.Group();

  group.name = 'route-destination-pin';



  // Base concentric red ring

  const ringGeo = new THREE.RingGeometry(1.8, 2.4, 32);

  const ringMat = new THREE.MeshBasicMaterial({

    color: 0xdc2626,

    side: THREE.DoubleSide,

    transparent: true,

    opacity: 0.85,

  });

  const ring = new THREE.Mesh(ringGeo, ringMat);

  ring.rotation.x = -Math.PI / 2;

  ring.position.y = 0.88;

  group.add(ring);



  // Vertical stem

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.4, 8);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 });

  const pole = new THREE.Mesh(poleGeo, poleMat);

  pole.position.y = 3.1;

  group.add(pole);



  // Top Sprite Badge

  const canvas = document.createElement('canvas');

  canvas.width = 280;

  canvas.height = 128;

  const ctx = canvas.getContext('2d');

  if (ctx) {

    ctx.fillStyle = '#dc2626';

    drawCanvasRoundRect(ctx, 8, 8, 264, 112, 24);

    ctx.fill();

    ctx.lineWidth = 6;

    ctx.strokeStyle = '#ffffff';

    ctx.stroke();



    ctx.fillStyle = '#ffffff';

    ctx.font = 'bold 34px Inter, sans-serif';

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillText('DESTINATION', 140, 64);

  }



  const texture = new THREE.CanvasTexture(canvas);

  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false });

  const sprite = new THREE.Sprite(spriteMat);

  sprite.position.y = 5.8;

  sprite.scale.set(7.0, 3.2, 1);

  group.add(sprite);



  return group;

}



export const Interactive3DMap: React.FC<Interactive3DMapProps> = ({

  currentLanguage,

  selectedFacility,

  onSelectFacility,

  activeCategoryFilter,

  onCategoryFilterChange,

  searchQuery,

  onSearchChange,

  userLocation,

  geolocationStatus,

  onRequestLocation,

  onOpenQrScanner,

  activeRoute,

  onStartRoute,

  onViewQrCode,

  onOpenCrowdReport,

  showCrowdHeatmap = false,

  crowdZones = [],

  routeOverviewTrigger,

  recenterTrigger,

  isFollowingUser = true,

  onToggleFollowUser,

}) => {

  const t = translations[currentLanguage];

  const containerRef = useRef<HTMLDivElement>(null);



  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  const [hoveredFacility, setHoveredFacility] = useState<Facility | null>(null);



  // References for Three.js engine

  const sceneRef = useRef<THREE.Scene | null>(null);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const modelsMapRef = useRef<Map<string, THREE.Group>>(new Map());

  const selectionHaloRef = useRef<THREE.Mesh | null>(null);

  const pilgrimControllerRef = useRef<PilgrimController | null>(null);

  const cartoonEnvRef = useRef<CartoonEnvironmentController | null>(null);

  const pilgrimTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const controlsRef = useRef<ThreeMapControls | null>(null);



  // Programmatic camera transitions (Google Maps style smooth easing)

  const isTransitioningRef = useRef<boolean>(false);

  const transitionRef = useRef<{

    startPos: THREE.Vector3;

    endPos: THREE.Vector3;

    startTarget: THREE.Vector3;

    endTarget: THREE.Vector3;

    progress: number;

    duration: number;

  }>({

    startPos: new THREE.Vector3(25, 60, 75),

    endPos: new THREE.Vector3(25, 60, 75),

    startTarget: new THREE.Vector3(25, 0, 0),

    endTarget: new THREE.Vector3(25, 0, 0),

    progress: 0,

    duration: 0.8,

  });



  const routeVisualGroupRef = useRef<THREE.Group | null>(null);

  const routeTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const pulseBallRef = useRef<THREE.Mesh | null>(null);

  const routeCurveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  const userLocationRef = useRef<UserLocation | null>(userLocation);

  const isFollowingUserRef = useRef<boolean>(isFollowingUser);

  const activeRouteRef = useRef<NavigationRoute | null>(activeRoute);
  const navLateralOffsetRef = useRef<number>(0);

  const animFrameIdRef = useRef<number | null>(null);

  const autoRecenterTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAutoRecenter = () => {
    if (autoRecenterTimerRef.current) {
      clearTimeout(autoRecenterTimerRef.current);
      autoRecenterTimerRef.current = null;
    }
  };

  const scheduleAutoRecenter = () => {
    clearAutoRecenter();
    if (!activeRouteRef.current) return;
    autoRecenterTimerRef.current = setTimeout(() => {
      if (activeRouteRef.current && userLocationRef.current) {
        handleReturnToLocation();
      }
    }, 7000);
  };




  useEffect(() => {

    isFollowingUserRef.current = isFollowingUser;

  }, [isFollowingUser]);



  useEffect(() => {

    activeRouteRef.current = activeRoute;

  }, [activeRoute]);

  // Focus camera on selected facility when chosen from Places tab or map
  useEffect(() => {
    if (selectedFacility && !activeRouteRef.current) {
      const pos = geoTo3D(selectedFacility.coordinates);
      const target = new THREE.Vector3(pos.x, 0, pos.z);
      const camPos =
        viewMode === '3D'
          ? new THREE.Vector3(pos.x, 38, pos.z + 42)
          : new THREE.Vector3(pos.x, 85, pos.z + 0.1);
      transitionCamera(camPos, target, 0.7);
    }
  }, [selectedFacility]);



  useEffect(() => {

    if (recenterTrigger && userLocationRef.current) {

      handleReturnToLocation();

    }

  }, [recenterTrigger]);

  const crowdGroupRef = useRef<THREE.Group | null>(null);

  const crowdPulsesRef = useRef<

    { mesh: THREE.Mesh; initialScale: number; speed: number; maxScale: number }[]

  >([]);



  // Smooth camera transition helper

  const transitionCamera = (endPos: THREE.Vector3, endTarget: THREE.Vector3, duration = 0.8) => {

    if (!controlsRef.current || !cameraRef.current) return;

    isTransitioningRef.current = true;

    transitionRef.current = {

      startPos: cameraRef.current.position.clone(),

      endPos: endPos.clone(),

      startTarget: controlsRef.current.target.clone(),

      endTarget: endTarget.clone(),

      progress: 0,

      duration: Math.max(0.3, duration),

    };

  };



  // Automatic Route Overview Camera Framing across entire festival grounds

  const frameRouteOverview = (route: NavigationRoute) => {

    isFollowingUserRef.current = false;

    if (onToggleFollowUser) onToggleFollowUser(false);

    if (!route || route.pathCoordinates.length < 2) return;

    const coords3D = route.pathCoordinates.map((c) => geoTo3D(c));

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

    coords3D.forEach((p) => {

      minX = Math.min(minX, p.x);

      maxX = Math.max(maxX, p.x);

      minZ = Math.min(minZ, p.z);

      maxZ = Math.max(maxZ, p.z);

    });



    const rawMidX = (minX + maxX) / 2;

    const rawMidZ = (minZ + maxZ) / 2;

    // Boundary protection: clamp target to valid festival grounds

    const midX = Math.max(-35, Math.min(95, rawMidX));

    const midZ = Math.max(-95, Math.min(75, rawMidZ));



    const spanX = maxX - minX;

    const spanZ = maxZ - minZ;

    const maxSpan = Math.max(spanX, spanZ, 45);

    const altitude = Math.max(65, Math.min(135, maxSpan * 1.05 + 25));



    const target = new THREE.Vector3(midX - 7, 0, midZ);

    const camPos = new THREE.Vector3(midX - 7, altitude, midZ + altitude * 0.85);

    transitionCamera(camPos, target, 0.9);

  };



  // Filter facilities based on category and search text

  const filteredFacilities = useMemo(() => {

    return FACILITIES_DATA.filter((f) => {

      const matchesCategory =

        activeCategoryFilter === 'all' || f.category === activeCategoryFilter;

      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =

        !q ||

        f.id.toLowerCase().includes(q) ||

        f.name.en.toLowerCase().includes(q) ||

        f.name.te.toLowerCase().includes(q) ||

        f.name.hi.toLowerCase().includes(q) ||

        f.description.en.toLowerCase().includes(q);



      return matchesCategory && matchesSearch;

    });

  }, [activeCategoryFilter, searchQuery]);



  // Initialize Three.js scene & Google Maps style MapControls

  useEffect(() => {

    const container = containerRef.current;

    if (!container) return;



    // Safe initial dimensions fallback prevents NaN camera aspect if container is initially hidden

    const initialW = container.clientWidth > 0 ? container.clientWidth : (typeof window !== 'undefined' ? window.innerWidth : 390);

    const initialH = container.clientHeight > 0 ? container.clientHeight : (typeof window !== 'undefined' ? window.innerHeight - 56 : 788);



    // 1. Scene - Vibrant Cartoon Atmosphere

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x38bdf8); // Sky blue cartoon river atmosphere

    scene.fog = new THREE.FogExp2(0xbae6fd, 0.0016); // Gentle atmospheric horizon

    sceneRef.current = scene;



    // 2. Camera (safe aspect ratio calculation prevents NaN)

    const isMobileInit = initialW < 768;
    const camera = new THREE.PerspectiveCamera(isMobileInit ? 54 : 45, initialW / initialH, 1, 1000);

    camera.position.set(25, 60, 75);

    cameraRef.current = camera;



    // 3. Renderer

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });

    if (container.clientWidth > 0 && container.clientHeight > 0) {

      renderer.setSize(container.clientWidth, container.clientHeight);

    } else {

      renderer.setSize(initialW, initialH);

    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;

    rendererRef.current = renderer;

    renderer.domElement.style.display = 'block';

    container.innerHTML = '';

    container.appendChild(renderer.domElement);



    // 4. Three.js MapControls - Authentic Google Maps Style Interaction

    const controls = new ThreeMapControls(camera, renderer.domElement);

    controls.enableDamping = true;

    controls.dampingFactor = 0.08;

    controls.screenSpacePanning = false; // pan parallel to ground plane

    controls.zoomToCursor = true; // cursor-centered zoom!

    controls.minDistance = 14;

    controls.maxDistance = 220;

    controls.maxPolarAngle = Math.PI / 2.18; // strictly prevent going below ground

    controls.minPolarAngle = 0.05; // allow top-down view

    controls.target.set(25, 0, 0);

    controlsRef.current = controls;



    // Cancel programmatic glide immediately if user takes control

    controls.addEventListener('start', () => {

      isTransitioningRef.current = false;

    });



    // 5. Lights

    const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.85);

    scene.add(ambientLight);



    const sunLight = new THREE.DirectionalLight(0xfef3c7, 1.4);

    sunLight.position.set(70, 110, 45);

    sunLight.castShadow = true;

    scene.add(sunLight);



    const riverFillLight = new THREE.DirectionalLight(0x0284c7, 0.35);

    riverFillLight.position.set(-60, 40, -20);

    scene.add(riverFillLight);



    // 6. Stylized Cartoon Environment

    const cartoonEnv = buildCartoonEnvironment(scene);

    cartoonEnvRef.current = cartoonEnv;



    // 7. Selection Halo

    const haloGeo = new THREE.RingGeometry(3.5, 4.2, 32);

    const haloMat = new THREE.MeshBasicMaterial({

      color: 0xf59e0b,

      side: THREE.DoubleSide,

      transparent: true,

      opacity: 0.9,

    });

    const halo = new THREE.Mesh(haloGeo, haloMat);

    halo.rotation.x = -Math.PI / 2;

    halo.position.y = 0.26;

    halo.visible = false;

    scene.add(halo);

    selectionHaloRef.current = halo;



    // 8. 3D Cartoon Pilgrim Character

    const pilgrimCtrl = createCartoonPilgrim(userLocationRef.current);

    scene.add(pilgrimCtrl.group);

    pilgrimControllerRef.current = pilgrimCtrl;



    // 9. Instantiate 3D Models for all 50 facilities

    modelsMapRef.current.clear();

    FACILITIES_DATA.forEach((facility) => {

      const model = createFacility3DModel(facility);

      const pos = geoTo3D(facility.coordinates);

      model.position.set(pos.x, pos.y, pos.z);

      scene.add(model);

      modelsMapRef.current.set(facility.id, model);

    });



    // 10. Crowd Heatmap Group

    const crowdGroup = new THREE.Group();

    crowdGroup.visible = false;

    scene.add(crowdGroup);

    crowdGroupRef.current = crowdGroup;



    // 11. Mouse Click vs Drag / Context Menu Listeners on Canvas

    const handleContextMenu = (e: MouseEvent) => {

      e.preventDefault(); // Prevents browser right-click menu so right-drag rotates

    };

    renderer.domElement.addEventListener('contextmenu', handleContextMenu);



    let pDownX = 0;

    let pDownY = 0;

    let pDownTime = 0;



    const handleDomPointerDown = (e: PointerEvent) => {

      pDownX = e.clientX;

      pDownY = e.clientY;

      pDownTime = performance.now();

    };



    const handleDomPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pDownX, e.clientY - pDownY);
      const duration = performance.now() - pDownTime;
      if (dist >= 14) {
        if (isFollowingUserRef.current) {
          isFollowingUserRef.current = false;
          if (onToggleFollowUser) onToggleFollowUser(false);
          scheduleAutoRecenter();
        }
      } else if (duration < 500 && e.button === 0) {
        performRaycast(e.clientX, e.clientY);
      }
    };



    const handleDomPointerMove = (e: PointerEvent) => {

      performHoverTest(e.clientX, e.clientY);

    };



    renderer.domElement.addEventListener('pointerdown', handleDomPointerDown);

    renderer.domElement.addEventListener('pointerup', handleDomPointerUp);

    renderer.domElement.addEventListener('pointermove', handleDomPointerMove);



    // 12. Animation Loop

    let clock = new THREE.Clock();

    const animate = () => {

      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      const time = clock.getElapsedTime();



      // Camera Control Update: Programmatic Transition or User MapControls

      if (isTransitioningRef.current) {

        transitionRef.current.progress += delta / transitionRef.current.duration;

        const t = Math.min(1.0, transitionRef.current.progress);

        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(transitionRef.current.startPos, transitionRef.current.endPos, ease);

        controls.target.lerpVectors(transitionRef.current.startTarget, transitionRef.current.endTarget, ease);

        controls.update();

        if (t >= 1.0) {

          isTransitioningRef.current = false;

        }

      } else {

        // Third-person camera follow mode during active navigation
        if (activeRouteRef.current && isFollowingUserRef.current && userLocationRef.current) {
          // Disable MapControls spherical damping inertia during active follow so it doesn't fight navigation
          controls.enableDamping = false;

          const user3D = geoTo3D([userLocationRef.current.lat, userLocationRef.current.lng]);
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          const { camPos, target, targetLateralOffset } = computeNavCameraTransform(
            user3D,
            userLocationRef.current.heading,
            activeRouteRef.current.pathCoordinates,
            isMobile,
            modelsMapRef.current,
            navLateralOffsetRef.current
          );

          // Smoothly interpolate dynamic lateral offset (prevents jumps and oscillation)
          navLateralOffsetRef.current += (targetLateralOffset - navLateralOffsetRef.current) * 0.08;

          controls.target.x += (target.x - controls.target.x) * 0.12;
          controls.target.y += (target.y - controls.target.y) * 0.12;
          controls.target.z += (target.z - controls.target.z) * 0.12;

          camera.position.x += (camPos.x - camera.position.x) * 0.10;
          camera.position.y += (camPos.y - camera.position.y) * 0.10;
          camera.position.z += (camPos.z - camera.position.z) * 0.10;

          camera.lookAt(controls.target);
          controls.update();
        } else {
          // Re-enable damping for smooth manual drag / zoom interactions
          controls.enableDamping = true;

          // Enforce city boundary protection on panning target
          controls.target.x = Math.max(-45, Math.min(115, controls.target.x));
          controls.target.z = Math.max(-110, Math.min(95, controls.target.z));
          controls.update();
        }

      }



      // Check dynamic zoom LOD threshold (Phase 2 dual signboards)

      const isZoomedIn = camera.position.y < 46;

      if (isZoomedIn !== lastZoomStateRef.current) {

        lastZoomStateRef.current = isZoomedIn;

        updateSignboardsLOD(isZoomedIn);

      }



      // Pulse Selection Halo

      if (selectionHaloRef.current && selectionHaloRef.current.visible) {

        const scale = 1 + 0.12 * Math.sin(time * 4);

        selectionHaloRef.current.scale.set(scale, scale, 1);

      }



      // Animate Route Chevron Texture flow

      if (routeTextureRef.current) {

        routeTextureRef.current.offset.x -= delta * 1.25;

      }



      // Animate Route Traveling Pulse Ball

      if (pulseBallRef.current && routeCurveRef.current) {

        const progress = (time * 0.22) % 1.0;

        const pt = routeCurveRef.current.getPointAt(progress);

        pulseBallRef.current.position.set(pt.x, 0.98, pt.z);

      }



      // Update Animated Crowd Pulse Rings

      if (crowdGroupRef.current && crowdGroupRef.current.visible) {

        crowdPulsesRef.current.forEach((pulse) => {

          const progress = (time * pulse.speed) % 1.0;

          const currentScale = pulse.initialScale + progress * (pulse.maxScale - pulse.initialScale);

          pulse.mesh.scale.set(currentScale, currentScale, 1);

          const mat = pulse.mesh.material as THREE.MeshBasicMaterial;

          if (mat) {

            mat.opacity = (1 - progress) * 0.75;

          }

        });

      }



      // Update 3D Cartoon Pilgrim

      if (pilgrimControllerRef.current && pilgrimControllerRef.current.group.visible) {

        pilgrimControllerRef.current.update(

          userLocationRef.current,

          pilgrimTargetPos.current,

          time,

          delta

        );

      }



      // Update Animated Cartoon Water Waves & Boats

      if (cartoonEnvRef.current) {

        cartoonEnvRef.current.update(time, delta);

      }



      renderer.render(scene, camera);

    };

    animate();



    // Testing helper for camera manipulation

    (window as any).__setCameraView = (

      posX: number,

      posY: number,

      posZ: number,

      targetX: number,

      targetY: number,

      targetZ: number

    ) => {

      camera.position.set(posX, posY, posZ);

      controls.target.set(targetX, targetY, targetZ);

      controls.update();

    };



    // 13. Dynamic Resize & Visibility Observer (Handles tab switching & orientation changes)

    const handleResize = () => {

      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

      const newW = containerRef.current.clientWidth;

      const newH = containerRef.current.clientHeight;

      if (newW > 0 && newH > 0) {

        cameraRef.current.aspect = newW / newH;

        cameraRef.current.fov = newW < 768 ? 54 : 45;

        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(newW, newH);

      }

    };



    const resizeObserver = new ResizeObserver((entries) => {

      for (const entry of entries) {

        const { width, height } = entry.contentRect;

        if (width > 0 && height > 0) {

          handleResize();

        }

      }

    });

    resizeObserver.observe(container);



    window.addEventListener('resize', handleResize);

    window.addEventListener('orientationchange', handleResize);



    return () => {

      resizeObserver.disconnect();
      clearAutoRecenter();

      window.removeEventListener('resize', handleResize);

      window.removeEventListener('orientationchange', handleResize);

      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);

      renderer.domElement.removeEventListener('pointerdown', handleDomPointerDown);

      renderer.domElement.removeEventListener('pointerup', handleDomPointerUp);

      renderer.domElement.removeEventListener('pointermove', handleDomPointerMove);

      controls.dispose();

      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

      renderer.dispose();

    };

  }, []);



  // Dynamic Signboard LOD & Visual Hierarchy (Phase 2)

  const lastZoomStateRef = useRef<boolean>(false);



  const updateSignboardsLOD = (isZoomedIn: boolean) => {

    modelsMapRef.current.forEach((model, facilityId) => {

      const signboard = model.getObjectByName(`signboard-${facilityId}`);

      if (!signboard || !signboard.userData) return;



      const { isMajorLandmark, isClusterLeader, fullBadgeSprite, compactPinSprite } = signboard.userData;



      if (isMajorLandmark || isClusterLeader) {

        fullBadgeSprite.visible = true;

        compactPinSprite.visible = false;

      } else {

        const isSelected = selectedFacility?.id === facilityId;

        const matchesCategory =

          activeCategoryFilter !== 'all' && activeCategoryFilter === signboard.userData.category;



        if (isZoomedIn || isSelected || matchesCategory) {

          fullBadgeSprite.visible = true;

          compactPinSprite.visible = false;

        } else {

          fullBadgeSprite.visible = false;

          compactPinSprite.visible = true;

        }

      }

    });

  };



  // Filter visibility updates

  useEffect(() => {

    const isFiltered = activeCategoryFilter !== 'all';

    modelsMapRef.current.forEach((model, facilityId) => {

      const isVisible = filteredFacilities.some((f) => f.id === facilityId);

      model.visible = isVisible;



      const signboard = model.getObjectByName(`signboard-${facilityId}`);

      if (signboard && signboard.userData) {

        const { isMajorLandmark, isClusterLeader, fullBadgeSprite, compactPinSprite } = signboard.userData;

        if (isFiltered) {

          fullBadgeSprite.visible = true;

          compactPinSprite.visible = false;

        } else if (!isMajorLandmark && !isClusterLeader && !lastZoomStateRef.current) {

          fullBadgeSprite.visible = false;

          compactPinSprite.visible = true;

        }

      }

    });

  }, [filteredFacilities, activeCategoryFilter]);



  // Selected facility camera gliding

  useEffect(() => {

    if (!selectedFacility) {

      if (selectionHaloRef.current) selectionHaloRef.current.visible = false;

      return;

    }



    const pos = geoTo3D(selectedFacility.coordinates);

    if (selectionHaloRef.current) {

      selectionHaloRef.current.position.set(pos.x, 0.26, pos.z);

      selectionHaloRef.current.visible = true;

    }

    // STRICT GUARD: Never launch destination focus camera transition when active navigation is running or starting!
    if (activeRouteRef.current || activeRoute) return;

    const target = new THREE.Vector3(pos.x, 0, pos.z);

    const camPos = new THREE.Vector3(

      pos.x,

      viewMode === '3D' ? 38 : 75,

      pos.z + (viewMode === '3D' ? 42 : 0.1)

    );

    transitionCamera(camPos, target, 0.8);

  }, [selectedFacility, viewMode, activeRoute]);



  // User location updates

  useEffect(() => {

    userLocationRef.current = userLocation;

    if (userLocation && pilgrimControllerRef.current) {

      const pos = geoTo3D([userLocation.lat, userLocation.lng]);

      pilgrimTargetPos.current.set(pos.x, 0.22, pos.z);

      pilgrimControllerRef.current.group.visible = true;

    }

  }, [userLocation]);



  // Update 3D Walkway Route Ribbon & Directional Chevrons

  useEffect(() => {

    if (!sceneRef.current) return;



    // Clean up previous route visuals

    if (routeVisualGroupRef.current) {

      sceneRef.current.remove(routeVisualGroupRef.current);

      routeVisualGroupRef.current.traverse((child) => {

        if (child instanceof THREE.Mesh) {

          child.geometry.dispose();

          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());

          else child.material.dispose();

        } else if (child instanceof THREE.Sprite) {

          child.material.dispose();

        }

      });

      routeVisualGroupRef.current = null;

    }

    routeTextureRef.current = null;

    pulseBallRef.current = null;

    routeCurveRef.current = null;



    if (activeRoute && activeRoute.pathCoordinates.length >= 2) {

      const waypoints = activeRoute.pathCoordinates.map((c) => {

        const p = geoTo3D(c);

        return new THREE.Vector3(p.x, 0.85, p.z);

      });



      const curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.15);

      routeCurveRef.current = curve;



      const group = new THREE.Group();

      group.name = 'route-visual-group';



      const isDetoured = !!activeRoute.congestionAvoided;

      const chevronTex = createRouteChevronTexture(isDetoured);

      routeTextureRef.current = chevronTex;



      // 1. Dual-layer glowing tube with chevron flow

      const tubeGeo = new THREE.TubeGeometry(curve, Math.max(20, waypoints.length * 10), 0.65, 8, false);

      const tubeMat = new THREE.MeshStandardMaterial({

        map: chevronTex,

        color: isDetoured ? 0x34d399 : 0x38bdf8,

        emissive: isDetoured ? 0x059669 : 0x0284c7,

        emissiveIntensity: 0.85,

        roughness: 0.25,

        metalness: 0.1,

      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);

      group.add(tubeMesh);



      // 2. 3D Directional Chevron Arrow Markers along the path

      const totalLen = curve.getLength();

      const stepMeters = 10;

      const numArrows = Math.max(1, Math.floor(totalLen / stepMeters));

      for (let i = 1; i <= numArrows; i++) {

        const u = (i * stepMeters) / totalLen;

        if (u > 0.04 && u < 0.96) {

          const pt = curve.getPointAt(u);

          const tangent = curve.getTangentAt(u).normalize();

          const arrow = createChevronMesh(isDetoured ? 0x6ee7b7 : 0xffffff);

          arrow.position.set(pt.x, 0.92, pt.z);

          arrow.rotation.z = Math.atan2(tangent.x, -tangent.z);

          group.add(arrow);

        }

      }



      // 3. Start Pin Marker (A)

      const startPt = waypoints[0];

      const startMarker = createStartPinMarker();

      startMarker.position.set(startPt.x, 0, startPt.z);

      group.add(startMarker);



      // 4. Destination Pin Marker (B)

      const endPt = waypoints[waypoints.length - 1];

      const destMarker = createDestinationPinMarker();

      destMarker.position.set(endPt.x, 0, endPt.z);

      group.add(destMarker);



      // 5. Glowing Travel Pulse Beacon

      const pulseGeo = new THREE.SphereGeometry(0.7, 16, 16);

      const pulseMat = new THREE.MeshBasicMaterial({

        color: isDetoured ? 0xa7f3d0 : 0xe0f2fe,

      });

      const pulseBall = new THREE.Mesh(pulseGeo, pulseMat);

      pulseBall.position.copy(startPt);

      group.add(pulseBall);

      pulseBallRef.current = pulseBall;



      sceneRef.current.add(group);

      routeVisualGroupRef.current = group;



      // Immediately cancel any in-progress destination transition camera glide
      isTransitioningRef.current = false;

      // Automatically enter third-person walking camera follow mode (Investigation V3)
      const loc = userLocationRef.current || userLocation;
      if (loc) {
        const pos = geoTo3D([loc.lat, loc.lng]);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

        if (cameraRef.current) {
          cameraRef.current.fov = isMobile ? 54 : 45;
          cameraRef.current.updateProjectionMatrix();
        }

        // Initialize target lateral offset immediately to clear any initial structure
        const initialCheck = computeNavCameraTransform(
          pos,
          loc.heading,
          activeRoute.pathCoordinates,
          isMobile,
          modelsMapRef.current,
          0
        );
        navLateralOffsetRef.current = initialCheck.targetLateralOffset;

        const { camPos, target } = computeNavCameraTransform(
          pos,
          loc.heading,
          activeRoute.pathCoordinates,
          isMobile,
          modelsMapRef.current,
          navLateralOffsetRef.current
        );
        transitionCamera(camPos, target, 0.85);
        isFollowingUserRef.current = true;
        if (onToggleFollowUser) onToggleFollowUser(true);
      }
    } else {
      // Restore default camera FOV when navigation ends
      if (cameraRef.current) {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        cameraRef.current.fov = isMobile ? 54 : 45;
        cameraRef.current.updateProjectionMatrix();
      }
    }
  }, [activeRoute]);

  // Separate trigger for user explicitly tapping Overview in Navigation HUD
  useEffect(() => {
    if (routeOverviewTrigger && activeRouteRef.current) {
      frameRouteOverview(activeRouteRef.current);
    }
  }, [routeOverviewTrigger]);



  // Update Crowd Heatmap Ground Overlays

  useEffect(() => {

    const crowdGroup = crowdGroupRef.current;

    if (!crowdGroup || !sceneRef.current) return;



    while (crowdGroup.children.length > 0) {

      const obj = crowdGroup.children[0];

      crowdGroup.remove(obj);

      if (obj instanceof THREE.Mesh) {

        obj.geometry.dispose();

        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());

        else obj.material.dispose();

      } else if (obj instanceof THREE.Group) {

        obj.traverse((child) => {

          if (child instanceof THREE.Mesh) {

            child.geometry.dispose();

            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());

            else child.material.dispose();

          }

        });

      }

    }

    crowdPulsesRef.current = [];



    if (!showCrowdHeatmap || !crowdZones || crowdZones.length === 0) {

      crowdGroup.visible = false;

      return;

    }

    crowdGroup.visible = true;



    crowdZones.forEach((zone) => {

      const pos = geoTo3D(zone.coordinates);

      const zoneGroup = new THREE.Group();

      zoneGroup.position.set(pos.x, 0.28, pos.z);



      const radius = zone.densityLevel === 'critical' ? 7.5 : zone.densityLevel === 'high' ? 6.5 : 5.0;

      const color =

        zone.densityLevel === 'critical'

          ? 0xef4444

          : zone.densityLevel === 'high'

          ? 0xf97316

          : zone.densityLevel === 'medium'

          ? 0xf59e0b

          : 0x10b981;



      const groundDiscGeo = new THREE.CircleGeometry(radius, 32);

      groundDiscGeo.rotateX(-Math.PI / 2);

      const groundDiscMat = new THREE.MeshBasicMaterial({

        color,

        transparent: true,

        opacity: zone.densityLevel === 'critical' ? 0.45 : zone.densityLevel === 'high' ? 0.35 : 0.22,

        side: THREE.DoubleSide,

      });

      const groundDisc = new THREE.Mesh(groundDiscGeo, groundDiscMat);

      zoneGroup.add(groundDisc);



      const pulseRingGeo = new THREE.RingGeometry(radius * 0.7, radius * 1.05, 32);

      pulseRingGeo.rotateX(-Math.PI / 2);

      const pulseRingMat = new THREE.MeshBasicMaterial({

        color,

        transparent: true,

        opacity: 0.75,

        side: THREE.DoubleSide,

      });

      const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);

      zoneGroup.add(pulseRing);



      crowdPulsesRef.current.push({

        mesh: pulseRing,

        initialScale: 0.6,

        speed: zone.densityLevel === 'critical' ? 1.4 : 0.8,

        maxScale: 1.4,

      });



      if (zone.densityLevel === 'critical' || zone.densityLevel === 'high') {

        const beaconGeo = new THREE.ConeGeometry(0.8, 3.5, 16);

        beaconGeo.rotateX(Math.PI);

        const beaconMat = new THREE.MeshLambertMaterial({

          color,

          transparent: true,

          opacity: 0.85,

        });

        const beacon = new THREE.Mesh(beaconGeo, beaconMat);

        beacon.position.y = 1.75;

        zoneGroup.add(beacon);

      }



      crowdGroup.add(zoneGroup);

    });

  }, [showCrowdHeatmap, crowdZones]);



  // Raycasting for click interaction

  const performRaycast = (clientX: number, clientY: number) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const hitObjects: THREE.Object3D[] = [];
    modelsMapRef.current.forEach((model) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
          hitObjects.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(hitObjects, false);
    if (intersects.length > 0) {
      for (const hit of intersects) {
        let top: THREE.Object3D | null = hit.object;
        while (top && !top.userData.facilityId && top.parent) {
          top = top.parent;
        }
        if (top && top.userData.facilityId) {
          const found = FACILITIES_DATA.find((f) => f.id === top.userData.facilityId);
          if (found) {
            onSelectFacility(found);
            return;
          }
        }
      }
    }

    // Screen-space proximity fallback for mobile finger taps:
    // If raycast missed direct geometry, find nearest facility within 28 screen pixels
    let nearestFac: Facility | null = null;
    let minScreenDist = 28;

    FACILITIES_DATA.forEach((fac) => {
      const pos3D = geoTo3D(fac.coordinates);
      const worldVec = new THREE.Vector3(pos3D.x, 3, pos3D.z);
      worldVec.project(cameraRef.current!);
      const screenX = ((worldVec.x + 1) / 2) * rect.width + rect.left;
      const screenY = ((-worldVec.y + 1) / 2) * rect.height + rect.top;
      const dist = Math.hypot(clientX - screenX, clientY - screenY);
      if (dist < minScreenDist) {
        minScreenDist = dist;
        nearestFac = fac;
      }
    });

    if (nearestFac) {
      onSelectFacility(nearestFac);
      return;
    }

    // On desktop, clicking empty ground deselects.
    // On mobile, keep the modal open to avoid accidental closures from finger touch; close via explicit [X].
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      onSelectFacility(null);
    }
  };



  // Hover test for tooltips

  const performHoverTest = (clientX: number, clientY: number) => {

    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const x = ((clientX - rect.left) / rect.width) * 2 - 1;

    const y = -((clientY - rect.top) / rect.height) * 2 + 1;



    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);



    const hitObjects: THREE.Object3D[] = [];

    modelsMapRef.current.forEach((model) => {

      if (model.visible) {

        model.traverse((child) => {

          if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) hitObjects.push(child);

        });

      }

    });



    const intersects = raycaster.intersectObjects(hitObjects, false);

    if (intersects.length > 0) {

      let top: THREE.Object3D | null = intersects[0].object;

      while (top && !top.userData.facilityId && top.parent) {

        top = top.parent;

      }

      if (top && top.userData.facilityId) {

        const found = FACILITIES_DATA.find((f) => f.id === top.userData.facilityId);

        setHoveredFacility(found || null);

        return;

      }

    }

    setHoveredFacility(null);

  };



  // View Controls

  const handleToggleViewMode = () => {

    const nextMode = viewMode === '3D' ? '2D' : '3D';

    setViewMode(nextMode);



    if (controlsRef.current) {

      const target = controlsRef.current.target;

      if (nextMode === '2D') {

        controlsRef.current.maxPolarAngle = 0.1; // Lock to top-down

        transitionCamera(new THREE.Vector3(target.x, 135, target.z + 0.1), target, 0.8);

      } else {

        controlsRef.current.maxPolarAngle = Math.PI / 2.18;

        transitionCamera(new THREE.Vector3(target.x, 65, target.z + 85), target, 0.8);

      }

    }

  };



  const handleZoomIn = () => {

    if (controlsRef.current) {

      controlsRef.current.dollyIn(1.25);

      controlsRef.current.update();

    }

  };



  const handleZoomOut = () => {

    if (controlsRef.current) {

      controlsRef.current.dollyOut(1.25);

      controlsRef.current.update();

    }

  };



  const handleResetView = () => {

    onSelectFacility(null);

    const target = new THREE.Vector3(25, 0, -5);

    const camPos = viewMode === '3D' ? new THREE.Vector3(30, 75, 95) : new THREE.Vector3(25, 140, 0.1);

    transitionCamera(camPos, target, 0.8);

  };



  const handleRotate = () => {

    if (controlsRef.current && cameraRef.current) {

      const angle = Math.PI / 4; // 45 degrees

      const target = controlsRef.current.target;

      const cam = cameraRef.current.position;

      const relX = cam.x - target.x;

      const relZ = cam.z - target.z;

      const newX = relX * Math.cos(angle) - relZ * Math.sin(angle);

      const newZ = relX * Math.sin(angle) + relZ * Math.cos(angle);

      transitionCamera(new THREE.Vector3(target.x + newX, cam.y, target.z + newZ), target, 0.5);

    }

  };



  const handleReturnToLocation = () => {
    clearAutoRecenter();
    const loc = userLocationRef.current || userLocation;
    if (loc) {
      const pos = geoTo3D([loc.lat, loc.lng]);
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const isNav = !!activeRouteRef.current;

      if (isNav && activeRouteRef.current) {
        const { camPos, target, targetLateralOffset } = computeNavCameraTransform(
          pos,
          loc.heading,
          activeRouteRef.current.pathCoordinates,
          isMobile,
          modelsMapRef.current,
          navLateralOffsetRef.current
        );
        navLateralOffsetRef.current = targetLateralOffset;
        transitionCamera(viewMode === '3D' ? camPos : new THREE.Vector3(pos.x, 85, pos.z + 0.1), target, 0.7);
      } else {
        const followDist = 26;
        const followHeight = 22;
        const camPos =
          viewMode === '3D'
            ? new THREE.Vector3(pos.x, followHeight, pos.z + followDist)
            : new THREE.Vector3(pos.x, 85, pos.z + 0.1);
        transitionCamera(camPos, new THREE.Vector3(pos.x, 0, pos.z), 0.7);
      }
      isFollowingUserRef.current = true;
      if (onToggleFollowUser) onToggleFollowUser(true);
    } else {
      onRequestLocation();
    }
  };



  return (

    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans">

      {/* Three.js Canvas Container */}

      <div

        ref={containerRef}

        className="w-full h-full cursor-grab active:cursor-grabbing"

      />



      {/* Top Search & Category Filter Overlay Bar (Hidden during active route guidance) */}

      {!activeRoute && (

        <div className="absolute top-4 left-4 right-16 z-20 pointer-events-none flex flex-col space-y-2">

        {/* Search Input Box */}

        <div className="pointer-events-auto max-w-md w-full bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl flex items-center px-3 py-2 text-white">

          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />

          <input

            type="text"

            value={searchQuery}

            onChange={(e) => onSearchChange(e.target.value)}

            placeholder={t.places.searchPlaceholder}

            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"

          />

          {searchQuery && (

            <button

              onClick={() => onSearchChange('')}

              className="text-xs text-slate-400 hover:text-white ml-1 font-bold"

            >

              ✕

            </button>

          )}

        </div>



        {/* Filter Pills Scroll Container */}

        <div className="pointer-events-auto flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-2xl scrollbar-none">

          <button

            onClick={() => onCategoryFilterChange('all')}

            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${

              activeCategoryFilter === 'all'

                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'

                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'

            }`}

          >

            {t.places.allCategories}

          </button>

          <button

            onClick={() => onCategoryFilterChange('foodStalls')}

            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${

              activeCategoryFilter === 'foodStalls'

                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'

                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'

            }`}

          >

            {t.places.categories.foodStalls}

          </button>

          <button

            onClick={() => onCategoryFilterChange('poojaStalls')}

            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${

              activeCategoryFilter === 'poojaStalls'

                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'

                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'

            }`}

          >

            {t.places.categories.poojaStalls}

          </button>

          <button

            onClick={() => onCategoryFilterChange('ghats')}

            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${

              activeCategoryFilter === 'ghats'

                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'

                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'

            }`}

          >

            {t.places.categories.ghats}

          </button>

          <button

            onClick={() => onCategoryFilterChange('temples')}

            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${

              activeCategoryFilter === 'temples'

                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'

                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'

            }`}

          >

            {t.places.categories.temples}

          </button>

          <button

            onClick={() => onCategoryFilterChange('medical')}

            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${

              activeCategoryFilter === 'medical'

                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'

                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'

            }`}

          >

            {t.places.categories.medical}

          </button>

          <button

            onClick={() => onCategoryFilterChange('helpcentres')}

            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${

              activeCategoryFilter === 'helpcentres'

                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'

                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'

            }`}

          >

            {t.places.categories.helpCentres}

          </button>

        </div>

      </div>

      )}



      {/* Live GPS / User Location Status Pill */}

      {userLocation && (

        <div className="absolute top-20 left-4 z-20 pointer-events-auto bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl border border-blue-500/70 shadow-xl flex items-center space-x-2">

          <Navigation className="w-3.5 h-3.5 text-blue-400 fill-current animate-pulse" />

          <span className="font-bold">

            {userLocation.source === 'live_gps'

              ? `${t.gps.liveLocation} (±${Math.round(userLocation.accuracy || 0)}m)`

              : `Start: ${userLocation.label || 'Manual Landmark'}`}

          </span>

          <span className="text-[10px] text-blue-300 font-mono">

            {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E

          </span>

        </div>

      )}



      {/* Hover Tooltip Overlay */}

      {hoveredFacility && (

        <div className="absolute top-36 left-4 z-20 pointer-events-none bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-amber-500/70 shadow-xl flex items-center space-x-2">

          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />

          <span className="font-bold">{hoveredFacility.name[currentLanguage] || hoveredFacility.name.en}</span>

          <span className="text-[10px] text-amber-300 font-mono">({hoveredFacility.id})</span>

        </div>

      )}



      {/* Floating Google Maps Style Toolbar Controls (Top Right) */}

      <MapControlsToolbar

        currentLanguage={currentLanguage}

        viewMode={viewMode}

        onToggleViewMode={handleToggleViewMode}

        onZoomIn={handleZoomIn}

        onZoomOut={handleZoomOut}

        onResetView={handleResetView}

        onRotate={handleRotate}

        geolocationStatus={geolocationStatus}

        onRequestLocation={onRequestLocation}

        onOpenQrScanner={onOpenQrScanner}

        onOpenCrowdReport={onOpenCrowdReport}

        userLocation={userLocation}

        isRouteActive={!!activeRoute}

        onRouteOverview={() => {

          if (activeRoute) frameRouteOverview(activeRoute);

        }}

        onReturnToLocation={handleReturnToLocation}

      />



      {/* Floating Recenter / Follow Me HUD Button during Active Navigation */}
      {activeRoute && !isFollowingUser && (
        <div className="absolute bottom-32 md:bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={handleReturnToLocation}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs rounded-full shadow-2xl border-2 border-white/90 transition-all cursor-pointer ring-4 ring-blue-500/30"
            aria-label="Recenter on User"
          >
            <Navigation className="w-4 h-4 fill-white stroke-none animate-pulse" />
            <span className="tracking-wide uppercase font-black text-xs">
              {currentLanguage === 'te'
                ? 'తిరిగి కేంద్రీకరించు'
                : currentLanguage === 'hi'
                ? 'पुनः केंद्रित करें'
                : 'Recenter'}
            </span>
          </button>
        </div>
      )}

      {/* Selected Facility Detail Card (Bottom Left) */}

      {!activeRoute && (

        <FacilityDetailModal

          facility={selectedFacility}

          userLocation={userLocation}

          currentLanguage={currentLanguage}

          onClose={() => onSelectFacility(null)}

          onFocusModel={(fac) => {

            if (activeRouteRef.current || activeRoute) return;

            const pos = geoTo3D(fac.coordinates);

            const target = new THREE.Vector3(pos.x, 0, pos.z);

            const camPos = new THREE.Vector3(

              pos.x,

              viewMode === '3D' ? 38 : 75,

              pos.z + (viewMode === '3D' ? 42 : 0.1)

            );

            transitionCamera(camPos, target, 0.8);

          }}

          onStartRoute={onStartRoute}

          onViewQrCode={onViewQrCode}

        />

      )}



      {/* Data Accuracy & Attribution Notice at Bottom */}

      <div className="absolute bottom-14 md:bottom-0 left-0 right-0 z-10 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-4 py-1.5 text-[11px] text-slate-300 flex items-center justify-between">

        <div className="flex items-center space-x-2 truncate">

          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />

          <span className="truncate">{t.map.illustrativeNotice}</span>

        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[10px] text-slate-400 pl-2 flex-shrink-0">

          <span>Center: 17.0015° N, 81.7795° E</span>

          <span>• Godavari Riverfront</span>

        </div>

      </div>

    </div>

  );

};

