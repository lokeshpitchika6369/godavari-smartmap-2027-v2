import { Facility, NavigationRoute, RouteStep, UserLocation } from '../types';

/**
 * Calculates Haversine distance between two coordinates in meters.
 */
export function calculateHaversineDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371000; // Earth's radius in meters
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

/**
 * Calculates compass bearing from coord1 to coord2 in degrees (0-360).
 */
export function calculateBearingDegrees(
  coord1: [number, number],
  coord2: [number, number]
): number {
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

// -------------------------------------------------------------
// PEDESTRIAN WALKWAY NETWORK GRAPH
// Authentic riverfront corridor along Pushkar Ghat / Bund Road
// -------------------------------------------------------------
export interface WalkwayNode {
  id: string;
  name: { en: string; te: string; hi: string };
  coordinates: [number, number]; // [lat, lng]
  level: 'upper_bund' | 'lower_promenade' | 'connector_ramp';
}

export const WALKWAY_NODES: Record<string, WalkwayNode> = {
  // Upper Bund Road Walkway (East corridor)
  'node-bund-north-gate': {
    id: 'node-bund-north-gate',
    name: {
      en: 'North Gate 01 Checkpoint',
      te: 'ఉత్తర ద్వారం 01 చెక్‌పాయింట్',
      hi: 'उत्तर द्वार 01 चेकपॉइंट',
    },
    coordinates: [17.00961, 81.77799],
    level: 'upper_bund',
  },
  'node-bund-kotilingala': {
    id: 'node-bund-kotilingala',
    name: {
      en: 'Upper Kotilingala Temple Junction',
      te: 'ఎగువ కోటిలింగాల ఆలయ జంక్షన్',
      hi: 'ऊपरी कोटिशिवलिंग मंदिर जंक्शन',
    },
    coordinates: [17.00655, 81.77969],
    level: 'upper_bund',
  },
  'node-bund-clinic-north': {
    id: 'node-bund-clinic-north',
    name: {
      en: 'Disaster Relief Clinic 02 Corridor',
      te: 'విపత్తు సహాయ క్లినిక్ 02 కారిడార్',
      hi: 'आपदा राहत क्लिनिक 02 गलियारा',
    },
    coordinates: [17.00546, 81.78063],
    level: 'upper_bund',
  },
  'node-bund-parking-access': {
    id: 'node-bund-parking-access',
    name: {
      en: 'Parking Ground A Pedestrian Cross',
      te: 'పార్కింగ్ గ్రౌండ్ A పాదచారుల మార్గం',
      hi: 'पार्किंग मैदान A पैदल पार पथ',
    },
    coordinates: [17.00465, 81.78665],
    level: 'upper_bund',
  },
  'node-bund-food-strip-north': {
    id: 'node-bund-food-strip-north',
    name: {
      en: 'Food Plaza North (Stalls F-104 & F-105)',
      te: 'ఆహార ప్రాంగణం నార్త్ (స్టాళ్లు F-104 & F-105)',
      hi: 'खाद्य प्लाजा उत्तर (स्टॉल F-104 एवं F-105)',
    },
    coordinates: [17.00492, 81.78345],
    level: 'upper_bund',
  },
  'node-bund-food-strip-south': {
    id: 'node-bund-food-strip-south',
    name: {
      en: 'Food Plaza South (Stalls F-101 to F-103)',
      te: 'ఆహార ప్రాంగణం సౌత్ (స్టాళ్లు F-101 నుండి F-103)',
      hi: 'खाद्य प्लाजा दक्षिण (स्टॉल F-101 से F-103)',
    },
    coordinates: [17.00312, 81.78345],
    level: 'upper_bund',
  },
  'node-bund-central-arch': {
    id: 'node-bund-central-arch',
    name: {
      en: 'Central Main Gate 02 (Pushkar Arch)',
      te: 'కేంద్ర ప్రధాన ద్వారం 02 (పుష్కర్ ఆర్చ్)',
      hi: 'केंद्रीय मुख्य द्वार 02 (पुष्कर मेहराब)',
    },
    coordinates: [17.00180, 81.78119],
    level: 'upper_bund',
  },
  'node-bund-helpdesk-lockers': {
    id: 'node-bund-helpdesk-lockers',
    name: {
      en: 'Central Helpdesk & Secure Lockers Plaza',
      te: 'ప్రధాన సహాయ కేంద్రం & లాకర్ల ప్రాంగణం',
      hi: 'केंद्रीय सहायता डेस्क एवं लॉकर प्लाजा',
    },
    coordinates: [17.00114, 81.78232],
    level: 'upper_bund',
  },
  'node-bund-water-toilet': {
    id: 'node-bund-water-toilet',
    name: {
      en: 'Civic Amenities Hub (Sanitation 01 & Water Station)',
      te: 'పౌర సదుపాయాల కేంద్రం (శౌచాలయాలు & తాగునీరు)',
      hi: 'नागरिक सुविधा केंद्र (शौचालय एवं पेयजल)',
    },
    coordinates: [17.00294, 81.78496],
    level: 'upper_bund',
  },
  'node-bund-south-mid': {
    id: 'node-bund-south-mid',
    name: {
      en: 'South Promenade Approach Walkway',
      te: 'దక్షిణ నడక మార్గం అప్రోచ్',
      hi: 'दक्षिणी प्रोमेनेड एप्रोच वॉकवे',
    },
    coordinates: [16.99934, 81.78232],
    level: 'upper_bund',
  },
  'node-bund-south-gate': {
    id: 'node-bund-south-gate',
    name: {
      en: 'South Entry Gate 03 (Saraswati)',
      te: 'దక్షిణ ప్రవేశ ద్వారం 03 (సరస్వతి)',
      hi: 'दक्षिण प्रवेश द्वार 03 (सरस्वती)',
    },
    coordinates: [16.99384, 81.78703],
    level: 'upper_bund',
  },

  // Lower Riverfront Promenade (West corridor next to water)
  'node-promenade-kotilingala': {
    id: 'node-promenade-kotilingala',
    name: {
      en: 'Kotilingala Ghat 01 Steps',
      te: 'కోటిలింగాల ఘాట్ 01 మెట్లు',
      hi: 'कोटिशिवलिंग घाट 01 सीढ़ियां',
    },
    coordinates: [17.00691, 81.77555],
    level: 'lower_promenade',
  },
  'node-promenade-temple': {
    id: 'node-promenade-temple',
    name: {
      en: 'Sri Markandeya Swamy Temple Steps',
      te: 'శ్రీ మార్కండేయ స్వామి దేవాలయ మెట్లు',
      hi: 'श्री मार्कंडेय स्वामी मंदिर सीढ़ियां',
    },
    coordinates: [17.00384, 81.77894],
    level: 'lower_promenade',
  },
  'node-promenade-pushkar-north': {
    id: 'node-promenade-pushkar-north',
    name: {
      en: 'Pushkar Ghat North Bathing Platform',
      te: 'పుష్కర్ ఘాట్ ఉత్తర స్నాన వేదిక',
      hi: 'पुष्कर घाट उत्तर स्नान मंच',
    },
    coordinates: [17.00204, 81.77856],
    level: 'lower_promenade',
  },
  'node-promenade-pushkar-center': {
    id: 'node-promenade-pushkar-center',
    name: {
      en: 'Pushkar Ghat Central VIP Pavilion',
      te: 'పుష్కర్ ఘాట్ ప్రధాన కేంద్ర మండపం',
      hi: 'पुष्कर घाट मुख्य केंद्रीय मंडप',
    },
    coordinates: [17.00150, 81.77875],
    level: 'lower_promenade',
  },
  'node-promenade-pinda-mandapam': {
    id: 'node-promenade-pinda-mandapam',
    name: {
      en: 'Pinda Pradanam Covered Mandapam',
      te: 'పిండ ప్రదాన కవర్డ్ మండపం',
      hi: 'पिंड दान कवर्ड मंडप',
    },
    coordinates: [16.99862, 81.78119],
    level: 'lower_promenade',
  },
  'node-promenade-pooja-strip': {
    id: 'node-promenade-pooja-strip',
    name: {
      en: 'Holy Water Canister & Pooja Stalls Strip (P-201 to P-205)',
      te: 'పవిత్ర జలాల పాత్రలు & పూజా స్టాళ్ల మార్గం (P-201 నుండి P-205)',
      hi: 'पवित्र जल पात्र एवं पूजा स्टॉल पट्टी (P-201 से P-205)',
    },
    coordinates: [16.99916, 81.78176],
    level: 'lower_promenade',
  },
  'node-promenade-announcements': {
    id: 'node-promenade-announcements',
    name: {
      en: 'Acoustic Announcement Mast 01',
      te: 'ప్రజా ప్రకటనల కేంద్రం టవర్ 01',
      hi: 'ध्वनि उद्घोषणा टावर 01',
    },
    coordinates: [17.00222, 81.78044],
    level: 'lower_promenade',
  },
  'node-promenade-saraswati': {
    id: 'node-promenade-saraswati',
    name: {
      en: 'Saraswati Ghat 03 River Terrace',
      te: 'సరస్వతి ఘాట్ 03 నదీ తీరం',
      hi: 'सरस्वती घाट 03 नदी तट',
    },
    coordinates: [16.99564, 81.78326],
    level: 'lower_promenade',
  },

  // Connecting Stairways and Ramps
  'ramp-kotilingala': {
    id: 'ramp-kotilingala',
    name: {
      en: 'Kotilingala Temple Access Ramp',
      te: 'కోటిలింగాల ఆలయ ర్యాంప్ మార్గం',
      hi: 'कोटिशिवलिंग मंदिर प्रवेश रैंप',
    },
    coordinates: [17.00672, 81.77762],
    level: 'connector_ramp',
  },
  'ramp-temple-bund': {
    id: 'ramp-temple-bund',
    name: {
      en: 'Markandeya Bund Connecting Flight',
      te: 'మార్కండేయ గట్టు మెట్ల మార్గం',
      hi: 'मार्कंडेय तटबंध सीढ़ी मार्ग',
    },
    coordinates: [17.00384, 81.78006],
    level: 'connector_ramp',
  },
  'ramp-central-pushkar': {
    id: 'ramp-central-pushkar',
    name: {
      en: 'Pushkar Grand Ceremonial Ramp',
      te: 'పుష్కర్ ప్రధాన స్వాగత ర్యాంప్',
      hi: 'पुष्कर मुख्य भव्य रैंप',
    },
    coordinates: [17.00168, 81.77988],
    level: 'connector_ramp',
  },
  'ramp-south-pooja': {
    id: 'ramp-south-pooja',
    name: {
      en: 'Pooja Plaza South Staircase',
      te: 'పూజా ప్రాంగణం దక్షిణ మెట్లు',
      hi: 'पूजा प्लाजा दक्षिणी सीढ़ी',
    },
    coordinates: [16.99988, 81.78176],
    level: 'connector_ramp',
  },

  // Phase 2B Expanded Regional Network Walkway Nodes
  'node-bund-south-terminal': {
    id: 'node-bund-south-terminal',
    name: {
      en: 'South Inter-District Bus Concourse',
      te: 'దక్షిణ అంతర్-జిల్లా బస్సు ప్రాంగణం',
      hi: 'दक्षिण अंतर-जिला बस परिसर',
    },
    coordinates: [16.99591, 81.78750],
    level: 'upper_bund',
  },
  'node-bund-north-two-wheelers': {
    id: 'node-bund-north-two-wheelers',
    name: {
      en: 'North Two-Wheeler Transit Corridor',
      te: 'ఉత్తర ద్విచక్ర వాహనాల కారిడార్',
      hi: 'उत्तर दोपहिया वाहन गलियारा',
    },
    coordinates: [17.00826, 81.78402],
    level: 'upper_bund',
  },
  'node-bund-east-gate-04': {
    id: 'node-bund-east-gate-04',
    name: {
      en: 'East Highway Gate 04 Corridor',
      te: 'తూర్పు హైవే గేట్ 04 కారిడార్',
      hi: 'पूर्वी राजमार्ग द्वार 04 गलियारा',
    },
    coordinates: [17.00285, 81.78844],
    level: 'upper_bund',
  },
  'node-bund-central-annadanam': {
    id: 'node-bund-central-annadanam',
    name: {
      en: 'Maha Annadanam Hall Concourse',
      te: 'మహా అన్నదాన భవన ప్రాంగణం',
      hi: 'महा अन्नदान भवन परिसर',
    },
    coordinates: [17.00204, 81.78590],
    level: 'upper_bund',
  },
  'node-promenade-north-rest': {
    id: 'node-promenade-north-rest',
    name: {
      en: 'Promenade North Shaded Rest Deck',
      te: 'నడక మార్గ ఉత్తర నీడ విశ్రాంతి వేదిక',
      hi: 'प्रोमेनेड उत्तर छायादार विश्राम डेक',
    },
    coordinates: [17.00555, 81.77687],
    level: 'lower_promenade',
  },
};

// Bidirectional edges in the network
export const WALKWAY_EDGES: [string, string][] = [
  // Upper Bund Longitudinal Backbone
  ['node-bund-north-gate', 'node-bund-kotilingala'],
  ['node-bund-kotilingala', 'node-bund-clinic-north'],
  ['node-bund-clinic-north', 'node-bund-parking-access'],
  ['node-bund-parking-access', 'node-bund-food-strip-north'],
  ['node-bund-food-strip-north', 'node-bund-food-strip-south'],
  ['node-bund-food-strip-south', 'node-bund-water-toilet'],
  ['node-bund-water-toilet', 'node-bund-central-arch'],
  ['node-bund-central-arch', 'node-bund-helpdesk-lockers'],
  ['node-bund-helpdesk-lockers', 'node-bund-south-mid'],
  ['node-bund-south-mid', 'node-bund-south-gate'],

  // Lower Riverfront Promenade Longitudinal Backbone
  ['node-promenade-kotilingala', 'node-promenade-temple'],
  ['node-promenade-temple', 'node-promenade-pushkar-north'],
  ['node-promenade-pushkar-north', 'node-promenade-pushkar-center'],
  ['node-promenade-pushkar-center', 'node-promenade-pinda-mandapam'],
  ['node-promenade-pinda-mandapam', 'node-promenade-pooja-strip'],
  ['node-promenade-pooja-strip', 'node-promenade-saraswati'],

  // Connectors linking Upper Bund to Lower Promenade
  ['node-bund-kotilingala', 'ramp-kotilingala'],
  ['ramp-kotilingala', 'node-promenade-kotilingala'],

  ['node-bund-clinic-north', 'ramp-temple-bund'],
  ['ramp-temple-bund', 'node-promenade-temple'],
  ['ramp-temple-bund', 'node-bund-food-strip-north'],

  ['node-bund-central-arch', 'ramp-central-pushkar'],
  ['ramp-central-pushkar', 'node-promenade-announcements'],
  ['node-promenade-announcements', 'node-promenade-pushkar-north'],
  ['node-promenade-announcements', 'node-promenade-pushkar-center'],

  ['node-bund-food-strip-south', 'ramp-central-pushkar'],

  ['node-bund-helpdesk-lockers', 'ramp-south-pooja'],
  ['ramp-south-pooja', 'node-promenade-pooja-strip'],

  ['node-bund-south-gate', 'node-promenade-saraswati'],

  // Phase 2B Expanded Regional Network Edges
  ['node-bund-south-gate', 'node-bund-south-terminal'],
  ['node-bund-north-gate', 'node-bund-north-two-wheelers'],
  ['node-bund-central-arch', 'node-bund-east-gate-04'],
  ['node-bund-parking-access', 'node-bund-east-gate-04'],
  ['node-bund-central-arch', 'node-bund-central-annadanam'],
  ['node-bund-helpdesk-lockers', 'node-bund-central-annadanam'],
  ['node-promenade-kotilingala', 'node-promenade-north-rest'],
  ['node-promenade-north-rest', 'node-promenade-temple'],
];

// Build adjacency map for Dijkstra
const adjacencyMap: Map<string, { target: string; distance: number }[]> = new Map();

function getAdjacencyList() {
  if (adjacencyMap.size > 0) return adjacencyMap;
  Object.keys(WALKWAY_NODES).forEach((k) => adjacencyMap.set(k, []));

  WALKWAY_EDGES.forEach(([u, v]) => {
    const nodeU = WALKWAY_NODES[u];
    const nodeV = WALKWAY_NODES[v];
    if (nodeU && nodeV) {
      const dist = calculateHaversineDistanceMeters(nodeU.coordinates, nodeV.coordinates);
      adjacencyMap.get(u)?.push({ target: v, distance: dist });
      adjacencyMap.get(v)?.push({ target: u, distance: dist });
    }
  });
  return adjacencyMap;
}

/**
 * Finds the nearest WalkwayNode to any given coordinate.
 */
export function findNearestWalkwayNode(coord: [number, number]): WalkwayNode {
  let closest: WalkwayNode = Object.values(WALKWAY_NODES)[0];
  let minDistance = Infinity;

  Object.values(WALKWAY_NODES).forEach((node) => {
    const d = calculateHaversineDistanceMeters(coord, node.coordinates);
    if (d < minDistance) {
      minDistance = d;
      closest = node;
    }
  });

  return closest;
}

/**
 * Dijkstra shortest path algorithm along the verified pedestrian network.
 * Accepts optional nodeCrowdFactors map for congestion-aware routing:
 * Effective Edge Weight: W_eff = W_base * (1 + crowd_factor)
 * Fallback / default multiplier is strictly 1.0 when crowd data is absent or 0.
 */
export function findShortestPathBetweenNodes(
  startNodeId: string,
  endNodeId: string,
  nodeCrowdFactors?: Map<string, number> | null
): string[] {
  if (startNodeId === endNodeId) return [startNodeId];

  const adj = getAdjacencyList();
  const distances: Map<string, number> = new Map();
  const previous: Map<string, string | null> = new Map();
  const unvisited: Set<string> = new Set();

  Object.keys(WALKWAY_NODES).forEach((nodeId) => {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  });

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let smallestDist = Infinity;

    unvisited.forEach((nodeId) => {
      const dist = distances.get(nodeId) ?? Infinity;
      if (dist < smallestDist) {
        smallestDist = dist;
        current = nodeId;
      }
    });

    if (!current || smallestDist === Infinity) break;
    if (current === endNodeId) break;

    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.target)) continue;

      // Congestion-aware multiplier calculation:
      // W_eff = W_base * (1 + crowd_factor)
      let crowdFactor = 0.0;
      if (nodeCrowdFactors && nodeCrowdFactors.size > 0) {
        const factorU = nodeCrowdFactors.get(current) ?? 0.0;
        const factorV = nodeCrowdFactors.get(neighbor.target) ?? 0.0;
        crowdFactor = Math.max(factorU, factorV);
      }
      const weightMultiplier = 1.0 + crowdFactor;
      const effectiveEdgeWeight = neighbor.distance * weightMultiplier;

      const alt = smallestDist + effectiveEdgeWeight;
      if (alt < (distances.get(neighbor.target) ?? Infinity)) {
        distances.set(neighbor.target, alt);
        previous.set(neighbor.target, current);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endNodeId;
  while (curr) {
    path.unshift(curr);
    curr = previous.get(curr) || null;
    if (curr === startNodeId) {
      path.unshift(startNodeId);
      break;
    }
  }

  return path.length > 0 && path[0] === startNodeId ? path : [];
}

export interface PedestrianRoutingOptions {
  avoidCrowds?: boolean;
  crowdFactors?: Map<string, number> | null;
  isEmergencyPriority?: boolean;
}

/**
 * Calculates a complete pedestrian walking route from Origin to Destination Facility.
 * Supports dynamic crowd congestion avoidance and safety emergency priority.
 */
export function calculatePedestrianRoute(
  origin: UserLocation,
  destination: Facility,
  options?: PedestrianRoutingOptions
): NavigationRoute {
  let originCoord: [number, number] = [origin.lat, origin.lng];
  const destCoord: [number, number] = destination.coordinates;

  // Event Perimeter Geofence Guard (2,500m):
  // If origin is off-site, clamp pedestrian origin to Central Main Gate 02 (Pushkar Arch)
  const distFromCenter = calculateHaversineDistanceMeters(originCoord, [17.0015, 81.7795]);
  if (distFromCenter > 2500) {
    originCoord = [17.0018, 81.7812];
  }

  // 1. Identify closest network nodes
  const startNode = findNearestWalkwayNode(originCoord);
  const endNode = findNearestWalkwayNode(destCoord);

  // Safety invariant: Emergency SOS routes strictly bypass congestion detours for direct aid access
  const isEmergency = !!options?.isEmergencyPriority;
  const shouldAvoidCrowds = !isEmergency && !!options?.avoidCrowds && !!options?.crowdFactors;
  const crowdFactors = shouldAvoidCrowds ? options.crowdFactors : null;

  // 2. Solve shortest path on pedestrian network graph
  const nodePathIds = findShortestPathBetweenNodes(startNode.id, endNode.id, crowdFactors);

  // Compare against baseline path (multiplier = 1.0x) to evaluate detour
  let baselineNodePathIds = nodePathIds;
  if (shouldAvoidCrowds) {
    baselineNodePathIds = findShortestPathBetweenNodes(startNode.id, endNode.id, null);
  }

  // 3. Assemble full coordinates sequence: Origin -> startNode -> ... -> endNode -> Destination
  const pathCoords: [number, number][] = [originCoord];

  nodePathIds.forEach((id) => {
    const node = WALKWAY_NODES[id];
    if (node) {
      // Don't duplicate if identical to last
      const last = pathCoords[pathCoords.length - 1];
      if (
        !last ||
        Math.abs(last[0] - node.coordinates[0]) > 0.00001 ||
        Math.abs(last[1] - node.coordinates[1]) > 0.00001
      ) {
        pathCoords.push(node.coordinates);
      }
    }
  });

  // Finally append destination coordinate
  pathCoords.push(destCoord);

  // 4. Calculate total cumulative distance (physical walking distance)
  let totalDistance = 0;
  for (let i = 0; i < pathCoords.length - 1; i++) {
    totalDistance += calculateHaversineDistanceMeters(pathCoords[i], pathCoords[i + 1]);
  }

  // Calculate baseline distance if detour taken
  const pathDetoured = shouldAvoidCrowds && JSON.stringify(nodePathIds) !== JSON.stringify(baselineNodePathIds);
  let baselineDistance = totalDistance;
  if (pathDetoured) {
    const bCoords: [number, number][] = [originCoord];
    baselineNodePathIds.forEach((id) => {
      const n = WALKWAY_NODES[id];
      if (n) bCoords.push(n.coordinates);
    });
    bCoords.push(destCoord);
    let bDist = 0;
    for (let i = 0; i < bCoords.length - 1; i++) {
      bDist += calculateHaversineDistanceMeters(bCoords[i], bCoords[i + 1]);
    }
    baselineDistance = bDist;
  }

  // 5. Estimated walking pace: ~72 meters/minute (~4.3 km/h average pilgrim walking pace)
  const walkingMinutes = Math.max(1, Math.round(totalDistance / 72));

  // 6. Generate step-by-step turn guidance
  const steps: RouteStep[] = [];
  for (let i = 0; i < pathCoords.length - 1; i++) {
    const segDist = calculateHaversineDistanceMeters(pathCoords[i], pathCoords[i + 1]);
    const bearing = calculateBearingDegrees(pathCoords[i], pathCoords[i + 1]);

    let turnType: RouteStep['turnType'] = 'straight';
    if (i > 0) {
      const prevBearing = calculateBearingDegrees(pathCoords[i - 1], pathCoords[i]);
      let diff = bearing - prevBearing;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      if (diff > 45) turnType = 'right';
      else if (diff > 20) turnType = 'slight_right';
      else if (diff < -45) turnType = 'left';
      else if (diff < -20) turnType = 'slight_left';
      else turnType = 'straight';
    }

    // Name of target node or destination
    let targetNameEn = destination.name.en;
    let targetNameTe = destination.name.te;
    let targetNameHi = destination.name.hi;

    if (i < nodePathIds.length) {
      const n = WALKWAY_NODES[nodePathIds[i]];
      if (n) {
        targetNameEn = n.name.en;
        targetNameTe = n.name.te;
        targetNameHi = n.name.hi;
      }
    }

    const isLast = i === pathCoords.length - 2;
    if (isLast) turnType = 'arrive';

    steps.push({
      id: `step-${i}`,
      instruction: {
        en: isLast
          ? `Walk ${segDist}m and arrive at ${destination.name.en}`
          : turnType === 'straight'
          ? `Continue ${segDist}m along walkway toward ${targetNameEn}`
          : `Turn ${turnType.replace('_', ' ')} and walk ${segDist}m toward ${targetNameEn}`,
        te: isLast
          ? `${segDist}మీ. నడిచి ${destination.name.te} వద్దకు చేరుకోండి`
          : turnType === 'straight'
          ? `${targetNameTe} వైపు నడక మార్గంలో ${segDist}మీ. ముందుకు సాగండి`
          : `${targetNameTe} వైపు తిరిగి ${segDist}మీ. నడవండి`,
        hi: isLast
          ? `${segDist}मी. पैदल चलकर ${destination.name.hi} पर पहुंचें`
          : turnType === 'straight'
          ? `${targetNameHi} की ओर पैदल मार्ग पर ${segDist}मी. सीधे चलें`
          : `${targetNameHi} की ओर मुड़ें और ${segDist}मी. आगे बढ़ें`,
      },
      distanceMeters: segDist,
      turnType,
      coordinates: pathCoords[i],
    });
  }

  // 7. Check if user is already within proximity threshold
  const arrivalThresholdMeters = 15;
  const directDistance = calculateHaversineDistanceMeters(originCoord, destCoord);
  const isArrived = directDistance <= arrivalThresholdMeters;

  return {
    id: `route-${Date.now()}`,
    origin: {
      coordinates: originCoord,
      label: origin.label || 'User Location',
      source: origin.source,
    },
    destination,
    totalDistanceMeters: totalDistance,
    estimatedWalkingMinutes: walkingMinutes,
    pathCoordinates: pathCoords,
    steps,
    dataSource: 'pedestrian_walkway_network',
    isArrived,
    isCongestionAware: shouldAvoidCrowds,
    congestionAvoided: pathDetoured,
    originalDistanceMeters: baselineDistance,
    effectiveCongestionWeight: totalDistance,
  };
}

/**
 * Checks whether the current user position is within arrival distance of a target.
 */
export function isUserNearDestination(
  userCoord: [number, number],
  destCoord: [number, number],
  thresholdMeters: number = 15
): boolean {
  return calculateHaversineDistanceMeters(userCoord, destCoord) <= thresholdMeters;
}

/**
 * Standard average pedestrian walking speed in urban and festival environments:
 * 1.2 meters per second (~72 meters/minute, ~4.32 km/h).
 * Standards reference: Highway Capacity Manual (HCM 2010/2016 Pedestrian Chapters)
 * and Indian Roads Congress (IRC:103 Guidelines for Pedestrian Facilities).
 */
export const DOCUMENTED_WALKING_SPEED_MPS = 1.2;

/**
 * Calculates perpendicular / minimum distance from a point to a line segment in meters.
 */
export function distancePointToSegmentMeters(
  point: [number, number],
  segStart: [number, number],
  segEnd: [number, number]
): { distanceMeters: number; projection: [number, number]; t: number } {
  const [px, py] = point;
  const [ax, ay] = segStart;
  const [bx, by] = segEnd;

  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return {
      distanceMeters: calculateHaversineDistanceMeters(point, segStart),
      projection: segStart,
      t: 0,
    };
  }

  // Projection scalar t on segment [0, 1]
  const rawT = ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  const t = Math.max(0, Math.min(1, rawT));
  const projCoord: [number, number] = [ax + t * dx, ay + t * dy];

  return {
    distanceMeters: calculateHaversineDistanceMeters(point, projCoord),
    projection: projCoord,
    t,
  };
}

/**
 * Detects whether the user has deviated from the active planned walking route.
 * Off-route threshold is 25 meters (accounting for natural GPS accuracy margin).
 */
export function detectOffRouteDeviation(
  userCoord: [number, number],
  pathCoordinates: [number, number][],
  thresholdMeters: number = 25
): {
  isOffRoute: boolean;
  distanceToRouteMeters: number;
  nearestSegmentIndex: number;
} {
  if (!pathCoordinates || pathCoordinates.length < 2) {
    return { isOffRoute: false, distanceToRouteMeters: 0, nearestSegmentIndex: 0 };
  }

  let minDistance = Infinity;
  let nearestSegmentIndex = 0;

  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    const res = distancePointToSegmentMeters(
      userCoord,
      pathCoordinates[i],
      pathCoordinates[i + 1]
    );
    if (res.distanceMeters < minDistance) {
      minDistance = res.distanceMeters;
      nearestSegmentIndex = i;
    }
  }

  return {
    isOffRoute: minDistance > thresholdMeters,
    distanceToRouteMeters: Math.round(minDistance),
    nearestSegmentIndex,
  };
}

/**
 * Calculates remaining walking distance from the user's projected position on the route
 * to the final destination facility.
 */
export function calculateRemainingRouteDistanceMeters(
  userCoord: [number, number],
  pathCoordinates: [number, number][]
): number {
  if (!pathCoordinates || pathCoordinates.length === 0) return 0;
  if (pathCoordinates.length === 1) {
    return calculateHaversineDistanceMeters(userCoord, pathCoordinates[0]);
  }

  let minDistance = Infinity;
  let bestSegIndex = 0;
  let bestProjection: [number, number] = pathCoordinates[0];

  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    const res = distancePointToSegmentMeters(
      userCoord,
      pathCoordinates[i],
      pathCoordinates[i + 1]
    );
    if (res.distanceMeters < minDistance) {
      minDistance = res.distanceMeters;
      bestSegIndex = i;
      bestProjection = res.projection;
    }
  }

  // Distance from user to projection on segment
  let remaining = calculateHaversineDistanceMeters(userCoord, bestProjection);

  // Distance from projection point to end of this segment
  remaining += calculateHaversineDistanceMeters(
    bestProjection,
    pathCoordinates[bestSegIndex + 1]
  );

  // Plus sum of all remaining subsequent segments
  for (let j = bestSegIndex + 1; j < pathCoordinates.length - 1; j++) {
    remaining += calculateHaversineDistanceMeters(
      pathCoordinates[j],
      pathCoordinates[j + 1]
    );
  }

  return Math.round(remaining);
}

export interface NavigationProgressInfo {
  remainingDistanceMeters: number;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedEta: string;
  isArrived: boolean;
  isOffRoute: boolean;
  distanceToRouteMeters: number;
  currentStepIndex: number;
  currentStep: RouteStep | null;
  distanceToNextTurnMeters: number;
  nextStep: RouteStep | null;
}

/**
 * Computes live navigation progress, turn-by-turn guidance, and walking ETA.
 */
export function getNavigationProgress(
  userLocation: UserLocation,
  route: NavigationRoute,
  walkingSpeedMps: number = DOCUMENTED_WALKING_SPEED_MPS
): NavigationProgressInfo {
  const userCoord: [number, number] = [userLocation.lat, userLocation.lng];
  const destCoord: [number, number] = route.destination.coordinates;

  // Check arrival threshold (15m)
  const distToDest = calculateHaversineDistanceMeters(userCoord, destCoord);
  if (distToDest <= 15) {
    return {
      remainingDistanceMeters: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedEta: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isArrived: true,
      isOffRoute: false,
      distanceToRouteMeters: 0,
      currentStepIndex: Math.max(0, route.steps.length - 1),
      currentStep: route.steps[route.steps.length - 1] || null,
      distanceToNextTurnMeters: 0,
      nextStep: null,
    };
  }

  // Detect off-route
  const deviation = detectOffRouteDeviation(userCoord, route.pathCoordinates, 25);

  // Remaining physical distance along route
  const remainingDistance = calculateRemainingRouteDistanceMeters(
    userCoord,
    route.pathCoordinates
  );

  // Walking time and ETA
  const remainingSeconds = Math.max(1, Math.round(remainingDistance / walkingSpeedMps));
  const remainingMinutes = Math.max(1, Math.round(remainingSeconds / 60));
  const etaDate = new Date(Date.now() + remainingSeconds * 1000);
  const formattedEta = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Determine active step from nearest segment
  const stepIdx = Math.min(deviation.nearestSegmentIndex, route.steps.length - 1);
  const currentStep = route.steps[stepIdx] || null;
  const nextStep = route.steps[stepIdx + 1] || null;

  // Distance to the upcoming turn (end of current segment)
  const nextTurnCoord = route.pathCoordinates[Math.min(stepIdx + 1, route.pathCoordinates.length - 1)];
  const distanceToNextTurnMeters = calculateHaversineDistanceMeters(userCoord, nextTurnCoord);

  return {
    remainingDistanceMeters: remainingDistance,
    remainingMinutes,
    remainingSeconds,
    formattedEta,
    isArrived: false,
    isOffRoute: deviation.isOffRoute,
    distanceToRouteMeters: deviation.distanceToRouteMeters,
    currentStepIndex: stepIdx,
    currentStep,
    distanceToNextTurnMeters,
    nextStep,
  };
}
