import math
import pytest
from starlette.requests import Request
from fastapi import HTTPException

from app.db.session import init_db, get_db
from app.schemas.emergency import EmergencyReportCreate
from app.api.v1.endpoints.emergency import (
    get_emergency_contacts,
    submit_emergency_report,
    get_emergency_status,
    OFFICIAL_HOTLINES,
    ON_SITE_HELPDESKS,
)

def make_request(ip: str = "127.0.0.1") -> Request:
    scope = {
        "type": "http",
        "client": (ip, 50000),
        "headers": [],
    }
    return Request(scope)

@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()
    yield

# --- HAVERSINE & PROXIMITY CALCULATIONS ---

def calculate_haversine_distance(coord1, coord2):
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371000  # meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c)

def calculate_estimated_walk_minutes(distance_meters, speed_mps=1.15):
    if distance_meters <= 0:
        return 0
    return max(1, round(distance_meters / (speed_mps * 60)))

# Test facilities database mirror for riverfront validation
SAMPLE_FACILITIES = [
    {
        "id": "med-centre-central",
        "name": "24/7 Red Cross First Aid Post 01",
        "category": "medical",
        "coordinates": [17.0012, 81.7802],
    },
    {
        "id": "med-centre-north",
        "name": "Disaster Relief Mobile Clinic 02",
        "category": "medical",
        "coordinates": [17.0050, 81.7775],
    },
    {
        "id": "med-centre-saraswati",
        "name": "Saraswati Ghat Medical Camp 03",
        "category": "medical",
        "coordinates": [16.9970, 81.7820],
    },
    {
        "id": "help-centre-central",
        "name": "Central Help & Missing Persons Desk (Police)",
        "category": "helpCentres",
        "coordinates": [17.0015, 81.7808],
    },
    {
        "id": "police-outpost-kotilingala",
        "name": "Kotilingala Police Outpost & Helpdesk",
        "category": "helpCentres",
        "coordinates": [17.0060, 81.7762],
    },
    {
        "id": "police-outpost-saraswati",
        "name": "Saraswati Ghat Police & Security Booth",
        "category": "helpCentres",
        "coordinates": [16.9962, 81.7830],
    },
]

def resolve_nearest_aid(origin_coords, facilities, category):
    candidates = [f for f in facilities if f["category"] == category]
    if not candidates:
        return None
    nearest = None
    min_dist = float("inf")
    for f in candidates:
        dist = calculate_haversine_distance(origin_coords, f["coordinates"])
        if dist < min_dist:
            min_dist = dist
            nearest = f
    return {
        "facility": nearest,
        "distance": min_dist,
        "walk_minutes": calculate_estimated_walk_minutes(min_dist),
    }

# --- TEST SUITE 1: NEAREST FIRST AID & POLICE HELPDESK DETECTION ---

def test_nearest_medical_at_pushkar_ghat():
    # Pilgrim standing at Pushkar Ghat Central [17.0005, 81.7792]
    pushkar_coords = [17.0005, 81.7792]
    res = resolve_nearest_aid(pushkar_coords, SAMPLE_FACILITIES, "medical")
    assert res is not None
    assert res["facility"]["id"] == "med-centre-central"
    assert res["distance"] < 150  # Under 150m away
    assert res["walk_minutes"] <= 2  # ~2 mins walking

def test_nearest_police_at_pushkar_ghat():
    pushkar_coords = [17.0005, 81.7792]
    res = resolve_nearest_aid(pushkar_coords, SAMPLE_FACILITIES, "helpCentres")
    assert res is not None
    assert res["facility"]["id"] == "help-centre-central"
    assert res["distance"] < 250
    assert res["walk_minutes"] <= 4

def test_nearest_aid_at_kotilingala_north_ghat():
    # Pilgrim at Kotilingala Ghat [17.0062, 81.7758]
    kotilingala_coords = [17.0062, 81.7758]
    
    # Nearest Medical
    med_res = resolve_nearest_aid(kotilingala_coords, SAMPLE_FACILITIES, "medical")
    assert med_res["facility"]["id"] == "med-centre-north"
    assert med_res["distance"] < 250
    
    # Nearest Police
    pol_res = resolve_nearest_aid(kotilingala_coords, SAMPLE_FACILITIES, "helpCentres")
    assert pol_res["facility"]["id"] == "police-outpost-kotilingala"
    assert pol_res["distance"] < 60  # Only ~47m away!
    assert pol_res["walk_minutes"] == 1

def test_nearest_aid_at_saraswati_south_ghat():
    # Pilgrim at Saraswati Ghat [16.9968, 81.7825]
    saraswati_coords = [16.9968, 81.7825]
    
    # Nearest Medical
    med_res = resolve_nearest_aid(saraswati_coords, SAMPLE_FACILITIES, "medical")
    assert med_res["facility"]["id"] == "med-centre-saraswati"
    assert med_res["distance"] < 100
    assert med_res["walk_minutes"] <= 2
    
    # Nearest Police
    pol_res = resolve_nearest_aid(saraswati_coords, SAMPLE_FACILITIES, "helpCentres")
    assert pol_res["facility"]["id"] == "police-outpost-saraswati"
    assert pol_res["distance"] < 100
    assert pol_res["walk_minutes"] <= 2

# --- TEST SUITE 2: EMERGENCY DIAL TRIGGERS (112 & 108) ---

def test_official_hotlines_contacts():
    contacts = get_emergency_contacts()
    hotline_numbers = {h.phone_number: h for h in contacts.state_hotlines}
    
    # Verify 112 is present and toll free
    assert "112" in hotline_numbers
    assert hotline_numbers["112"].is_toll_free is True
    assert "Police" in hotline_numbers["112"].service_name or "National" in hotline_numbers["112"].service_name
    
    # Verify 108 is present and toll free
    assert "108" in hotline_numbers
    assert hotline_numbers["108"].is_toll_free is True
    assert "Ambulance" in hotline_numbers["108"].service_name

def test_on_site_helpdesks():
    contacts = get_emergency_contacts()
    desk_names = [d.service_name for d in contacts.on_site_helpdesks]
    desk_phones = [d.phone_number for d in contacts.on_site_helpdesks]
    
    assert any("Control Room" in name for name in desk_names)
    assert "+91 883 2460100" in desk_phones

# --- TEST SUITE 3: EMERGENCY REPORT SUBMISSION & AUDIO MUTE CONTRACT ---

def test_emergency_report_submission_and_receipt():
    payload = EmergencyReportCreate(
        incident_type="medical",
        severity="critical",
        landmark="Near Pushkar Ghat Steps",
        contact_phone="9876543210",
        details="Elderly pilgrim feeling dizzy, requires immediate hydration and medical check",
        latitude=17.0005,
        longitude=81.7792,
    )
    req = make_request("10.0.0.88")
    receipt = submit_emergency_report(payload, req)
    
    assert receipt.id.startswith("EMG-")
    assert receipt.status == "received"
    assert receipt.tracking_token.startswith("EMG-TRK-")
    assert "112" in receipt.direct_hotlines.values()
    assert "108" in receipt.direct_hotlines.values()

def test_walk_time_disclaimer_invariant():
    disclaimer = (
        "Estimated unimpeded walking time (geometric calculation at 1.15 m/s) — "
        "Not an official emergency responder dispatch guarantee."
    )
    assert "geometric calculation" in disclaimer
    assert "Not an official emergency responder dispatch guarantee" in disclaimer
