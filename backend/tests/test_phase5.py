import pytest
import os
import sqlite3
from starlette.requests import Request
from fastapi import HTTPException
from pydantic import ValidationError

from app.db.session import init_db, get_db, get_db_path
from app.core.config import settings
from app.core.security import validate_phone, mask_phone, mask_name, verify_admin_key
from app.schemas.emergency import EmergencyReportCreate
from app.schemas.missing_person import MissingPersonReportCreate, FoundPersonReportCreate
from app.schemas.crowd import CrowdReportCreate
from app.api.v1.endpoints.emergency import (
    get_emergency_contacts,
    submit_emergency_report,
    get_emergency_status,
)
from app.api.v1.endpoints.missing_persons import (
    submit_missing_person_report,
    get_active_missing_persons,
    get_missing_person_private_status,
    submit_found_person_report,
    get_active_found_persons,
)
from app.api.v1.endpoints.crowd import (
    submit_crowd_report,
    get_crowd_density_summary,
)
from app.api.v1.endpoints.admin import get_incident_audit_logs

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

# --- SUITE 1: Security & Masking Helpers ---

def test_validate_phone_valid():
    assert validate_phone("9876543210") == "+919876543210"
    assert validate_phone("+91 9876543210") == "+919876543210"
    assert validate_phone("919876543210") == "+919876543210"

def test_validate_phone_invalid():
    with pytest.raises(HTTPException) as exc_info:
        validate_phone("12345")
    assert exc_info.value.status_code == 422

    with pytest.raises(HTTPException):
        validate_phone("abcdefghij")

def test_masking_phone_and_name():
    assert mask_phone("+919876543210") == "+9198****3210"
    assert mask_name("Ramesh Kumar") == "R. Kumar"
    assert mask_name("Sita Devi Sharma") == "S. Devi Sharma"

# --- SUITE 2: Emergency Services & Honest Escalation ---

def test_emergency_contacts_advisory():
    contacts = get_emergency_contacts()
    assert "112" in [h.phone_number for h in contacts.state_hotlines]
    assert "108" in [h.phone_number for h in contacts.state_hotlines]
    assert "CRITICAL NOTICE" in contacts.official_disclaimer
    assert "does NOT claim automated dispatch" in contacts.official_disclaimer

def test_submit_emergency_report_success():
    req = make_request("192.168.1.101")
    report = EmergencyReportCreate(
        incident_type="medical",
        severity="critical",
        landmark="Near Pushkar Ghat Steps Pillar 4",
        latitude=17.0018,
        longitude=81.7812,
        contact_phone="9876500001",
        details="Elderly pilgrim collapsed near the lower bathing steps, requires first aid"
    )
    res = submit_emergency_report(report, req)
    assert res.id.startswith("EMG-")
    assert res.status == "received"
    assert res.tracking_token.startswith("EMG-TRK-")
    assert "112" in res.direct_hotlines.values()

    # Verify status lookup via private tracking token
    status_res = get_emergency_status(res.tracking_token)
    assert status_res.id == res.id
    assert status_res.status == "received"

def test_emergency_duplicate_rejection():
    req = make_request("192.168.1.102")
    report = EmergencyReportCreate(
        incident_type="fire",
        severity="high",
        landmark="Stall Zone East Gate B",
        latitude=17.0020,
        longitude=81.7810,
        contact_phone="9876500002",
        details="Small electrical spark near circuit breaker"
    )
    res1 = submit_emergency_report(report, req)
    assert res1.id.startswith("EMG-")

    # Second immediate submission with identical phone + landmark
    with pytest.raises(HTTPException) as exc_info:
        submit_emergency_report(report, req)
    assert exc_info.value.status_code == 409
    assert "already submitted" in exc_info.value.detail

# --- SUITE 3: Missing & Found Persons Privacy & Tracking ---

def test_submit_missing_person_and_privacy_redaction():
    req = make_request("192.168.1.103")
    report = MissingPersonReportCreate(
        person_name="Ananya Sharma",
        age=8,
        gender="female",
        description="Wearing yellow salwar kameez, speaks Telugu and Hindi, red ribbon",
        last_seen_location="Near Saraswathi Ghat Waiting Hall",
        last_seen_time="10:30 AM during morning pooja",
        clothing_details="Yellow dress, white sandals",
        contact_phone="9876500003",
        contact_name="Sunita Sharma",
        relationship="Mother"
    )
    res = submit_missing_person_report(report, req)
    assert res.id.startswith("MIS-")
    assert res.tracking_token.startswith("MIS-TRK-")
    assert res.status == "active"

    # Verify Public Feed does NOT expose unmasked phone or full contact name
    active_feed = get_active_missing_persons()
    matching = [p for p in active_feed if p.id == res.id]
    assert len(matching) == 1
    public_entry = matching[0]

    # Contact phone must be masked
    assert "****" in public_entry.contact_phone_masked
    assert "9876500003" not in public_entry.contact_phone_masked
    # Contact name must be masked
    assert public_entry.contact_name_masked == "S. Sharma"

    # Verify Private Status lookup yields unmasked contact info for authorized family
    private_res = get_missing_person_private_status(res.tracking_token)
    assert private_res.contact_phone == "+919876500003"
    assert private_res.contact_name == "Sunita Sharma"

def test_missing_person_invalid_age():
    with pytest.raises(ValidationError):
        MissingPersonReportCreate(
            person_name="Test Person",
            age=-5,
            gender="male",
            description="Test description of missing individual",
            last_seen_location="Central Gate",
            last_seen_time="9:00 AM",
            contact_phone="9876500099",
            contact_name="Parent Name",
            relationship="Father"
        )

def test_missing_person_description_min_length():
    with pytest.raises(ValidationError) as exc_info:
        MissingPersonReportCreate(
            person_name="Test Person",
            age=10,
            gender="male",
            description="short",  # 5 characters, violates min_length=10
            last_seen_location="Central Gate",
            last_seen_time="9:00 AM",
            contact_phone="9876500099",
            contact_name="Parent Name",
            relationship="Father"
        )
    assert "at least 10 characters" in str(exc_info.value)

def test_submit_found_person_and_public_feed():
    req = make_request("192.168.1.104")
    report = FoundPersonReportCreate(
        approximate_age="Child (~6 yrs)",
        gender="male",
        appearance_description="Wearing blue t-shirt and grey shorts, crying near gate",
        current_safekeeping_location="Kotilingala Ghat Police Outpost Booth 2",
        finder_contact_phone="9876500004",
        finder_name="Kiran Varma"
    )
    res = submit_found_person_report(report, req)
    assert res.id.startswith("FND-")
    assert res.status == "under_care"
    assert res.finder_name_masked == "K. Varma"

    # Verify active found persons feed
    found_feed = get_active_found_persons()
    match = [f for f in found_feed if f.id == res.id]
    assert len(match) == 1
    assert match[0].finder_name_masked == "K. Varma"

# --- SUITE 4: Crowd Congestion Reporting & Density Aggregation ---

def test_crowd_report_and_density_aggregation():
    req = make_request("192.168.1.105")
    report = CrowdReportCreate(
        location_name="Pushkar Main Bathing Ghat",
        latitude=17.0018,
        longitude=81.7812,
        congestion_level="high",
        reported_wait_minutes=25,
        comments="Dense flow near upper barricade entry"
    )
    res = submit_crowd_report(report, req)
    assert res.id.startswith("CRW-")
    assert res.congestion_level == "high"

    # Check aggregation
    summary = get_crowd_density_summary()
    assert summary.total_active_reports >= 1
    matching_loc = [loc for loc in summary.locations if loc.location_name == "Pushkar Main Bathing Ghat"]
    assert len(matching_loc) == 1
    assert matching_loc[0].report_count >= 1

def test_crowd_invalid_coordinates():
    with pytest.raises(ValidationError):
        CrowdReportCreate(
            location_name="Out of Bounds Point",
            latitude=28.6139, # Outside Godavari riverfront bounds
            longitude=77.2090,
            congestion_level="low"
        )

def test_rate_limiting_enforcement():
    req = make_request("192.168.1.200")
    # Category emergency allows max 5 requests per 10 minutes
    for i in range(5):
        report = EmergencyReportCreate(
            incident_type="other",
            severity="medium",
            landmark=f"Pillar Zone {i}",
            latitude=17.0010 + (i * 0.001),
            longitude=81.7810,
            contact_phone=f"987650010{i}",
            details=f"Test emergency report #{i}"
        )
        res = submit_emergency_report(report, req)
        assert res.id.startswith("EMG-")

    # 6th request from same IP should trigger 429
    report_6 = EmergencyReportCreate(
        incident_type="other",
        severity="medium",
        landmark="Pillar Zone 6",
        latitude=17.0016,
        longitude=81.7810,
        contact_phone="9876500106",
        details="Test emergency report #6"
    )
    with pytest.raises(HTTPException) as exc_info:
        submit_emergency_report(report_6, req)
    assert exc_info.value.status_code == 429
    assert "Rate limit reached" in exc_info.value.detail

# --- SUITE 5: Audit Logging & Access Control ---

def test_admin_audit_logs_unauthorized():
    with pytest.raises(HTTPException) as exc_info:
        verify_admin_key(None)
    assert exc_info.value.status_code == 401

    with pytest.raises(HTTPException) as exc_info:
        verify_admin_key("invalid-secret-key")
    assert exc_info.value.status_code == 401

def test_admin_audit_logs_authorized():
    assert verify_admin_key(settings.ADMIN_SECRET_KEY) is True
    logs = get_incident_audit_logs(limit=20)
    assert isinstance(logs, list)
    assert len(logs) > 0
    actions = [l.action for l in logs]
    assert "CREATED" in actions
