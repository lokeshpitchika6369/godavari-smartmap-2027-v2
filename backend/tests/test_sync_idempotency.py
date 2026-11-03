import pytest
import sqlite3
import uuid
from concurrent.futures import ThreadPoolExecutor
from starlette.requests import Request
from starlette.responses import Response
from fastapi import HTTPException, status

from app.db.session import init_db, get_db, get_db_path
from app.api.v1.endpoints.sync import sync_incident
from app.schemas.sync import IncidentSyncRequest

def make_request(ip: str = "127.0.0.1") -> Request:
    scope = {
        "type": "http",
        "client": (ip, 50000),
        "headers": [],
    }
    return Request(scope)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    # Clean test keys before each test
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM idempotency_keys WHERE idempotency_key LIKE 'test-%'")
        cursor.execute("DELETE FROM missing_person_reports WHERE person_name LIKE 'Test%'")
        cursor.execute("DELETE FROM found_person_reports WHERE finder_name LIKE 'Test%'")
        cursor.execute("DELETE FROM emergency_reports WHERE landmark LIKE 'Test%'")
        cursor.execute("DELETE FROM crowd_reports WHERE location_name LIKE 'Test%'")
    yield

# ==============================================================================
# TEST CASE 1: Fresh submission across all 4 incident types
# ==============================================================================
def test_fresh_submission_all_four_incident_types():
    req = make_request()

    # 1. missing_person
    key_missing = f"test-missing-{uuid.uuid4().hex}"
    resp1 = Response()
    res1 = sync_incident(
        IncidentSyncRequest(
            idempotency_key=key_missing,
            incident_type="missing_person",
            payload={
                "person_name": "Test Pilgrim Kumar",
                "age": 34,
                "gender": "male",
                "description": "Wearing blue kurta and glasses, lost near ghat",
                "last_seen_location": "Test Pushkar Ghat Steps",
                "last_seen_time": "10:30 AM",
                "clothing_details": "Blue kurta, white pajama",
                "contact_phone": "9876543210",
                "contact_name": "Sita Devi",
                "relationship": "Spouse"
            }
        ),
        req,
        resp1
    )
    assert resp1.status_code == status.HTTP_201_CREATED
    assert res1.duplicate_suppressed is False
    assert res1.incident_id.startswith("MIS-")
    assert res1.tracking_token is not None

    # 2. found_person
    key_found = f"test-found-{uuid.uuid4().hex}"
    resp2 = Response()
    res2 = sync_incident(
        IncidentSyncRequest(
            idempotency_key=key_found,
            incident_type="found_person",
            payload={
                "approximate_age": "Child (~6 yrs)",
                "gender": "male",
                "appearance_description": "Yellow shirt, speaks Telugu, sitting near outpost",
                "current_safekeeping_location": "Test Kotilingala Police Help Desk",
                "finder_contact_phone": "9876543211",
                "finder_name": "Test Officer Rao"
            }
        ),
        req,
        resp2
    )
    assert resp2.status_code == status.HTTP_201_CREATED
    assert res2.duplicate_suppressed is False
    assert res2.incident_id.startswith("FND-")

    # 3. emergency
    key_emergency = f"test-emergency-{uuid.uuid4().hex}"
    resp3 = Response()
    res3 = sync_incident(
        IncidentSyncRequest(
            idempotency_key=key_emergency,
            incident_type="emergency",
            payload={
                "incident_type": "medical",
                "severity": "critical",
                "landmark": "Test Saraswathi Ghat Bathing Area",
                "latitude": 17.002,
                "longitude": 81.782,
                "contact_phone": "9876543212",
                "details": "Elderly pilgrim experiencing severe dehydration and heat exhaustion"
            }
        ),
        req,
        resp3
    )
    assert resp3.status_code == status.HTTP_201_CREATED
    assert res3.duplicate_suppressed is False
    assert res3.incident_id.startswith("EMG-")

    # 4. crowd
    key_crowd = f"test-crowd-{uuid.uuid4().hex}"
    resp4 = Response()
    res4 = sync_incident(
        IncidentSyncRequest(
            idempotency_key=key_crowd,
            incident_type="crowd",
            payload={
                "location_name": "Test North Bridge Promenade",
                "latitude": 17.004,
                "longitude": 81.784,
                "congestion_level": "moderate",
                "reported_wait_minutes": 20,
                "comments": "Steady stream of pilgrims moving towards VIP ghat"
            }
        ),
        req,
        resp4
    )
    assert resp4.status_code == status.HTTP_201_CREATED
    assert res4.duplicate_suppressed is False
    assert res4.incident_id.startswith("CRW-")

    # Verify database persistence for all 4
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM idempotency_keys WHERE idempotency_key IN (?, ?, ?, ?)",
                       (key_missing, key_found, key_emergency, key_crowd))
        assert cursor.fetchone()[0] == 4

# ==============================================================================
# TEST CASE 2: Identical retry (Lost-response recovery)
# ==============================================================================
def test_identical_retry_lost_response_recovery():
    req = make_request()
    key = f"test-lost-resp-{uuid.uuid4().hex}"
    payload = {
        "location_name": "Test South Ghat Concourse",
        "latitude": 17.001,
        "longitude": 81.781,
        "congestion_level": "high",
        "reported_wait_minutes": 35,
        "comments": "High rush after evening aarti"
    }

    # Initial submission (HTTP 201)
    resp1 = Response()
    res1 = sync_incident(IncidentSyncRequest(idempotency_key=key, incident_type="crowd", payload=payload), req, resp1)
    assert resp1.status_code == status.HTTP_201_CREATED
    assert res1.duplicate_suppressed is False
    original_id = res1.incident_id

    # Simulate client retry after dropped connection / lost response (HTTP 200)
    resp2 = Response()
    res2 = sync_incident(IncidentSyncRequest(idempotency_key=key, incident_type="crowd", payload=payload), req, resp2)
    assert resp2.status_code == status.HTTP_200_OK
    assert res2.duplicate_suppressed is True
    assert res2.incident_id == original_id
    assert res2.data["location_name"] == payload["location_name"]

    # Verify no duplicate row was created in crowd_reports
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM crowd_reports WHERE location_name = ?", (payload["location_name"],))
        assert cursor.fetchone()[0] == 1

# ==============================================================================
# TEST CASE 3: Altered-payload retry returns HTTP 409 Conflict
# ==============================================================================
def test_altered_payload_returns_409_conflict():
    req = make_request()
    key = f"test-conflict-{uuid.uuid4().hex}"
    
    payload_original = {
        "incident_type": "stampede_risk",
        "severity": "high",
        "landmark": "Test East Enclosure Gate 2",
        "latitude": 17.003,
        "longitude": 81.783,
        "contact_phone": "9876543210",
        "details": "Surge of devotees attempting to enter enclosure simultaneously"
    }

    resp1 = Response()
    res1 = sync_incident(IncidentSyncRequest(idempotency_key=key, incident_type="emergency", payload=payload_original), req, resp1)
    assert resp1.status_code == status.HTTP_201_CREATED

    # Attempt to reuse the SAME key with MODIFIED payload
    payload_altered = dict(payload_original)
    payload_altered["contact_phone"] = "9998887776"  # Altered data

    resp2 = Response()
    with pytest.raises(HTTPException) as exc_info:
        sync_incident(IncidentSyncRequest(idempotency_key=key, incident_type="emergency", payload=payload_altered), req, resp2)

    assert exc_info.value.status_code == status.HTTP_409_CONFLICT
    assert "altered payload" in exc_info.value.detail.lower()

# ==============================================================================
# TEST CASE 4: Concurrent duplicate blast (10 simultaneous threads)
# ==============================================================================
def test_concurrent_duplicate_blast_single_commit():
    key = f"test-concurrent-{uuid.uuid4().hex}"
    payload = {
        "person_name": "Test Concurrent Devotee",
        "age": 45,
        "gender": "female",
        "description": "Green silk saree, lost near queue line barricade",
        "last_seen_location": "Test Main Temple Queue Line",
        "last_seen_time": "11:15 AM",
        "clothing_details": "Green silk saree",
        "contact_phone": "9876543215",
        "contact_name": "Ramesh Kumar",
        "relationship": "Brother"
    }

    def execute_sync():
        req = make_request()
        resp = Response()
        res = sync_incident(
            IncidentSyncRequest(idempotency_key=key, incident_type="missing_person", payload=payload),
            req,
            resp
        )
        return resp.status_code, res.incident_id, res.duplicate_suppressed

    # Blast 10 requests concurrently
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(execute_sync) for _ in range(10)]
        results = [f.result() for f in futures]

    statuses = [r[0] for r in results]
    incident_ids = [r[1] for r in results]
    duplicate_suppressed_flags = [r[2] for r in results]

    # Exactly 1 request should be HTTP 201 Created (duplicate_suppressed=False)
    assert statuses.count(status.HTTP_201_CREATED) == 1
    # Exactly 9 requests should be HTTP 200 OK (duplicate_suppressed=True)
    assert statuses.count(status.HTTP_200_OK) == 9
    assert duplicate_suppressed_flags.count(False) == 1
    assert duplicate_suppressed_flags.count(True) == 9

    # All 10 requests must agree on the exact same incident_id
    assert len(set(incident_ids)) == 1

    # Exactly 1 row in missing_person_reports and 1 row in idempotency_keys
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM missing_person_reports WHERE id = ?", (incident_ids[0],))
        assert cursor.fetchone()[0] == 1
        cursor.execute("SELECT COUNT(*) FROM idempotency_keys WHERE idempotency_key = ?", (key,))
        assert cursor.fetchone()[0] == 1

# ==============================================================================
# TEST CASE 5: Polymorphic referential integrity trigger (trg_idempotency_verify_insert)
# ==============================================================================
def test_polymorphic_referential_integrity_insert_trigger():
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Attempting to directly insert an idempotency key referencing a non-existent incident
    fake_key = f"test-fake-{uuid.uuid4().hex}"
    non_existent_id = "NON-EXISTENT-ID-999"

    with pytest.raises(sqlite3.IntegrityError) as exc_info:
        cursor.execute("""
            INSERT INTO idempotency_keys (
                idempotency_key, incident_type, incident_id, request_hash, tracking_token, response_payload
            ) VALUES (?, 'emergency', ?, 'fakehash', 'faketoken', '{}')
        """, (fake_key, non_existent_id))
        conn.commit()

    conn.close()
    assert "referential integrity violation" in str(exc_info.value).lower()

# ==============================================================================
# TEST CASE 6: Polymorphic cascade deletion triggers
# ==============================================================================
def test_polymorphic_cascade_deletion_triggers():
    req = make_request()
    key = f"test-cascade-{uuid.uuid4().hex}"
    resp = Response()
    res = sync_incident(
        IncidentSyncRequest(
            idempotency_key=key,
            incident_type="found_person",
            payload={
                "approximate_age": "Elderly (~75 yrs)",
                "gender": "male",
                "appearance_description": "White dhoti, holds walking cane, unable to state address",
                "current_safekeeping_location": "Test Camp Booth A",
                "finder_contact_phone": "9876543218",
                "finder_name": "Test Volunteer Anitha"
            }
        ),
        req,
        resp
    )
    assert resp.status_code == status.HTTP_201_CREATED
    incident_id = res.incident_id

    # Verify idempotency key is initially present
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM idempotency_keys WHERE idempotency_key = ?", (key,))
        assert cursor.fetchone()[0] == 1

        # Delete from parent found_person_reports
        cursor.execute("DELETE FROM found_person_reports WHERE id = ?", (incident_id,))

    # Verify the cascade trigger automatically removed the idempotency record
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM idempotency_keys WHERE idempotency_key = ?", (key,))
        assert cursor.fetchone()[0] == 0

# ==============================================================================
# TEST CASE 7: Primary key immutability triggers
# ==============================================================================
def test_primary_key_immutability_triggers():
    req = make_request()
    key = f"test-immutable-{uuid.uuid4().hex}"
    resp = Response()
    res = sync_incident(
        IncidentSyncRequest(
            idempotency_key=key,
            incident_type="crowd",
            payload={
                "location_name": "Test Immutable Checkpoint",
                "latitude": 17.001,
                "longitude": 81.781,
                "congestion_level": "low",
                "reported_wait_minutes": 5,
                "comments": "Clear corridor"
            }
        ),
        req,
        resp
    )
    assert resp.status_code == status.HTTP_201_CREATED
    incident_id = res.incident_id

    # Attempt to mutate the primary key
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    with pytest.raises(sqlite3.IntegrityError) as exc_info:
        cursor.execute("UPDATE crowd_reports SET id = 'MUTATED-ID' WHERE id = ?", (incident_id,))
        conn.commit()

    conn.close()
    assert "primary key violation" in str(exc_info.value).lower()

# ==============================================================================
# TEST CASE 8: Rollback durability on validation failure
# ==============================================================================
def test_rollback_on_validation_failure():
    req = make_request()
    key = f"test-invalid-{uuid.uuid4().hex}"
    resp = Response()

    # Invalid payload: age = 150 (exceeds max 120 constraint)
    invalid_payload = {
        "person_name": "Test Invalid Person",
        "age": 150,
        "gender": "male",
        "description": "Invalid age test",
        "last_seen_location": "Test Ghat",
        "last_seen_time": "12:00 PM",
        "contact_phone": "9876543210",
        "contact_name": "Reporter",
        "relationship": "Friend"
    }

    with pytest.raises(HTTPException) as exc_info:
        sync_incident(
            IncidentSyncRequest(
                idempotency_key=key,
                incident_type="missing_person",
                payload=invalid_payload
            ),
            req,
            resp
        )

    assert exc_info.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Verify atomic rollback: neither incident record nor idempotency_key was created
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM idempotency_keys WHERE idempotency_key = ?", (key,))
        assert cursor.fetchone()[0] == 0
        cursor.execute("SELECT COUNT(*) FROM missing_person_reports WHERE person_name = 'Test Invalid Person'")
        assert cursor.fetchone()[0] == 0
