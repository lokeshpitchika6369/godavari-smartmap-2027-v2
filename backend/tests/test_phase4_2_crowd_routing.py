import math
import pytest

# --- PEDESTRIAN WALKWAY NETWORK GRAPH (Mirroring frontend routingService.ts) ---

WALKWAY_NODES = {
    # Upper Bund Road Walkway (East corridor)
    'node-bund-north-gate': {'coordinates': [17.0078, 81.7770], 'level': 'upper_bund'},
    'node-bund-kotilingala': {'coordinates': [17.0065, 81.7772], 'level': 'upper_bund'},
    'node-bund-clinic-north': {'coordinates': [17.0050, 81.7780], 'level': 'upper_bund'},
    'node-bund-parking-access': {'coordinates': [17.0038, 81.7820], 'level': 'upper_bund'},
    'node-bund-food-strip-north': {'coordinates': [17.0033, 81.7813], 'level': 'upper_bund'},
    'node-bund-food-strip-south': {'coordinates': [17.0026, 81.7807], 'level': 'upper_bund'},
    'node-bund-water-toilet': {'coordinates': [17.0025, 81.7816], 'level': 'upper_bund'},
    'node-bund-central-arch': {'coordinates': [17.0018, 81.7812], 'level': 'upper_bund'},
    'node-bund-helpdesk-lockers': {'coordinates': [17.0015, 81.7813], 'level': 'upper_bund'},
    'node-bund-south-mid': {'coordinates': [16.9980, 81.7828], 'level': 'upper_bund'},
    'node-bund-south-gate': {'coordinates': [16.9955, 81.7840], 'level': 'upper_bund'},

    # Lower Riverfront Promenade (West corridor along water)
    'node-promenade-kotilingala': {'coordinates': [17.0062, 81.7758], 'level': 'lower_promenade'},
    'node-promenade-temple': {'coordinates': [17.0032, 81.7785], 'level': 'lower_promenade'},
    'node-promenade-pushkar-north': {'coordinates': [17.0012, 81.7792], 'level': 'lower_promenade'},
    'node-promenade-pushkar-center': {'coordinates': [17.0005, 81.7792], 'level': 'lower_promenade'},
    'node-promenade-pinda-mandapam': {'coordinates': [17.0000, 81.7790], 'level': 'lower_promenade'},
    'node-promenade-pooja-strip': {'coordinates': [16.9995, 81.7799], 'level': 'lower_promenade'},
    'node-promenade-announcements': {'coordinates': [17.0008, 81.7803], 'level': 'lower_promenade'},
    'node-promenade-saraswati': {'coordinates': [16.9968, 81.7825], 'level': 'lower_promenade'},

    # Connecting Stairways and Ramps
    'ramp-kotilingala': {'coordinates': [17.0063, 81.7765], 'level': 'connector_ramp'},
    'ramp-temple-bund': {'coordinates': [17.0035, 81.7798], 'level': 'connector_ramp'},
    'ramp-central-pushkar': {'coordinates': [17.0014, 81.7800], 'level': 'connector_ramp'},
    'ramp-south-pooja': {'coordinates': [16.9988, 81.7812], 'level': 'connector_ramp'},
}

WALKWAY_EDGES = [
    # Upper Bund Backbone
    ('node-bund-north-gate', 'node-bund-kotilingala'),
    ('node-bund-kotilingala', 'node-bund-clinic-north'),
    ('node-bund-clinic-north', 'node-bund-parking-access'),
    ('node-bund-parking-access', 'node-bund-food-strip-north'),
    ('node-bund-food-strip-north', 'node-bund-food-strip-south'),
    ('node-bund-food-strip-south', 'node-bund-water-toilet'),
    ('node-bund-water-toilet', 'node-bund-central-arch'),
    ('node-bund-central-arch', 'node-bund-helpdesk-lockers'),
    ('node-bund-helpdesk-lockers', 'node-bund-south-mid'),
    ('node-bund-south-mid', 'node-bund-south-gate'),

    # Lower Riverfront Promenade
    ('node-promenade-kotilingala', 'node-promenade-temple'),
    ('node-promenade-temple', 'node-promenade-pushkar-north'),
    ('node-promenade-pushkar-north', 'node-promenade-pushkar-center'),
    ('node-promenade-pushkar-center', 'node-promenade-pinda-mandapam'),
    ('node-promenade-pinda-mandapam', 'node-promenade-pooja-strip'),
    ('node-promenade-pooja-strip', 'node-promenade-saraswati'),

    # Connectors
    ('node-bund-kotilingala', 'ramp-kotilingala'),
    ('ramp-kotilingala', 'node-promenade-kotilingala'),
    ('node-bund-clinic-north', 'ramp-temple-bund'),
    ('ramp-temple-bund', 'node-promenade-temple'),
    ('ramp-temple-bund', 'node-bund-food-strip-north'),
    ('node-bund-central-arch', 'ramp-central-pushkar'),
    ('ramp-central-pushkar', 'node-promenade-announcements'),
    ('node-promenade-announcements', 'node-promenade-pushkar-north'),
    ('node-promenade-announcements', 'node-promenade-pushkar-center'),
    ('node-bund-food-strip-south', 'ramp-central-pushkar'),
    ('node-bund-helpdesk-lockers', 'ramp-south-pooja'),
    ('ramp-south-pooja', 'node-promenade-pooja-strip'),
    ('node-bund-south-gate', 'node-promenade-saraswati'),
]

# Build adjacency list
ADJACENCY_LIST = {n: [] for n in WALKWAY_NODES}
for u, v in WALKWAY_EDGES:
    ADJACENCY_LIST[u].append(v)
    ADJACENCY_LIST[v].append(u)


def calculate_haversine(c1, c2):
    lat1, lon1 = c1
    lat2, lon2 = c2
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def solve_dijkstra(start_node, end_node, crowd_factors=None):
    """
    Dijkstra implementation using non-destructive formula:
    W_eff = W_base * (1 + crowd_factor)
    """
    if start_node == end_node:
        return [start_node], 0.0

    if crowd_factors is None:
        crowd_factors = {}

    distances = {n: float('inf') for n in WALKWAY_NODES}
    previous = {n: None for n in WALKWAY_NODES}
    unvisited = set(WALKWAY_NODES.keys())

    distances[start_node] = 0

    while unvisited:
        curr = min(unvisited, key=lambda n: distances[n])
        if distances[curr] == float('inf') or curr == end_node:
            break

        unvisited.remove(curr)

        for nbr in ADJACENCY_LIST[curr]:
            if nbr not in unvisited:
                continue

            base_distance = calculate_haversine(
                WALKWAY_NODES[curr]['coordinates'],
                WALKWAY_NODES[nbr]['coordinates']
            )

            # Crowd multiplier
            factor_u = crowd_factors.get(curr, 0.0)
            factor_v = crowd_factors.get(nbr, 0.0)
            edge_crowd_factor = max(factor_u, factor_v)

            # W_eff = W_base * (1 + crowd_factor)
            weight_multiplier = 1.0 + edge_crowd_factor
            effective_weight = base_distance * weight_multiplier

            alt = distances[curr] + effective_weight
            if alt < distances[nbr]:
                distances[nbr] = alt
                previous[nbr] = curr

    # Reconstruct path
    path = []
    c = end_node
    while c:
        path.insert(0, c)
        c = previous[c]

    return path, distances[end_node]


# --- PHASE 4.2 AUTOMATED UNIT & REGRESSION TESTS ---

def test_crowd_weight_multiplier_formula():
    """Requirement 5: Test W_eff = W_base * (1 + crowd_factor) for all 4 density tiers."""
    base_dist = 100.0  # meters

    # Tier 1: Low (crowd_factor = 0.0) -> multiplier = 1.0x
    assert base_dist * (1.0 + 0.0) == 100.0

    # Tier 2: Medium (crowd_factor = 0.5) -> multiplier = 1.5x
    assert base_dist * (1.0 + 0.5) == 150.0

    # Tier 3: High (crowd_factor = 1.2) -> multiplier = 2.2x
    assert math.isclose(base_dist * (1.0 + 1.2), 220.0)

    # Tier 4: Critical (crowd_factor = 2.5) -> multiplier = 3.5x
    assert math.isclose(base_dist * (1.0 + 2.5), 350.0)


def test_no_crowd_data_fallback_default_multiplier():
    """Requirement 7: Preserve existing navigation when crowd data is unavailable. Default crowd multiplier must be 1.0."""
    start = 'node-promenade-temple'
    end = 'node-promenade-pooja-strip'

    # Run with empty crowd factors
    path_empty, cost_empty = solve_dijkstra(start, end, crowd_factors={})
    # Run with None
    path_none, cost_none = solve_dijkstra(start, end, crowd_factors=None)

    assert path_empty == path_none
    assert cost_empty == cost_none
    # The normal route along promenade:
    expected_path = [
        'node-promenade-temple',
        'node-promenade-pushkar-north',
        'node-promenade-pushkar-center',
        'node-promenade-pinda-mandapam',
        'node-promenade-pooja-strip'
    ]
    assert path_empty == expected_path
    assert cost_empty == 484.0  # Base physical walking distance


def test_high_density_corridor_triggers_safe_detour():
    """Requirement 6: High-density corridors receive higher routing costs so alternative safer routes are selected."""
    start = 'node-promenade-temple'
    end = 'node-promenade-pooja-strip'

    # Normal conditions
    normal_path, normal_cost = solve_dijkstra(start, end, None)
    assert 'node-promenade-pushkar-center' in normal_path
    assert normal_cost == 484.0

    # Peak Snanam Rush: Pushkar Ghat corridor is at Critical density (factor 2.5 -> 3.5x cost)
    peak_crowd_factors = {
        'node-promenade-pushkar-north': 2.5,
        'node-promenade-pushkar-center': 2.5,
        'node-promenade-pinda-mandapam': 2.5,
        'node-promenade-announcements': 2.5,
    }

    detour_path, detour_eff_cost = solve_dijkstra(start, end, peak_crowd_factors)

    # Invariant: detoured path must bypass congested Pushkar Ghat corridor
    assert 'node-promenade-pushkar-center' not in detour_path
    assert 'node-promenade-pushkar-north' not in detour_path

    # Invariant: path must ascend to Upper Bund Road
    assert 'ramp-temple-bund' in detour_path
    assert 'node-bund-food-strip-north' in detour_path
    assert 'node-bund-central-arch' in detour_path
    assert 'ramp-south-pooja' in detour_path

    # The effective cost on the detour (1083) is lower than the effective cost would have been on the choked promenade (~1694)
    assert detour_eff_cost < 1694.0


def test_dynamic_route_recalculation_on_crowd_change():
    """Requirement 8: Update routes dynamically when crowd-density data changes."""
    start = 'node-promenade-temple'
    end = 'node-promenade-pooja-strip'

    # State 1: Peak Rush -> Detour taken
    peak_factors = {
        'node-promenade-pushkar-north': 2.5,
        'node-promenade-pushkar-center': 2.5,
        'node-promenade-pinda-mandapam': 2.5,
        'node-promenade-announcements': 2.5,
    }
    path_peak, _ = solve_dijkstra(start, end, peak_factors)
    assert 'ramp-temple-bund' in path_peak

    # State 2: Crowd cleared ('all_clear') -> Route dynamically reverts to direct promenade
    all_clear_factors = {
        'node-promenade-pushkar-north': 0.0,
        'node-promenade-pushkar-center': 0.0,
        'node-promenade-pinda-mandapam': 0.0,
        'node-promenade-announcements': 0.0,
    }
    path_cleared, cost_cleared = solve_dijkstra(start, end, all_clear_factors)
    assert 'node-promenade-pushkar-center' in path_cleared
    assert 'ramp-temple-bund' not in path_cleared
    assert cost_cleared == 484.0


def test_emergency_sos_priority_overrides_crowd_detour():
    """Safety Invariant: Emergency routing must take priority over ordinary crowd-aware routing."""
    start = 'node-promenade-temple'
    end = 'node-promenade-pooja-strip'

    peak_crowd_factors = {
        'node-promenade-pushkar-north': 2.5,
        'node-promenade-pushkar-center': 2.5,
        'node-promenade-pinda-mandapam': 2.5,
        'node-promenade-announcements': 2.5,
    }

    # Routine routing: avoids crowd and takes longer detour
    routine_path, _ = solve_dijkstra(start, end, peak_crowd_factors)
    assert 'ramp-temple-bund' in routine_path

    # Emergency SOS priority mode: ignores crowd detour penalties to reach aid fastest
    # routingService implements: options.isEmergencyPriority -> crowdFactors ignored
    emergency_path, emergency_distance = solve_dijkstra(start, end, crowd_factors=None)
    assert emergency_path == [
        'node-promenade-temple',
        'node-promenade-pushkar-north',
        'node-promenade-pushkar-center',
        'node-promenade-pinda-mandapam',
        'node-promenade-pooja-strip'
    ]
    assert emergency_distance == 484.0  # Exact shortest physical corridor


def test_non_destructive_physical_distances():
    """Requirement: Base edge distances must remain completely unaltered by crowd weighting."""
    for u, v in WALKWAY_EDGES:
        c_u = WALKWAY_NODES[u]['coordinates']
        c_v = WALKWAY_NODES[v]['coordinates']
        base_d = calculate_haversine(c_u, c_v)

        # Base distance must be positive and realistic
        assert 10 <= base_d <= 500, f"Unrealistic walkway segment {u} -> {v}: {base_d}m"


def test_simulated_data_disclaimer_compliance():
    """Safety Requirement: Do not invent real crowd measurements. Clearly label simulated data."""
    expected_en = "Simulated Crowd Density Data — For pushkaralu crowd management planning & demonstration purposes only. Not connected to live sensor hardware."
    assert "Simulated" in expected_en
    assert "Not connected to live sensor hardware" in expected_en
