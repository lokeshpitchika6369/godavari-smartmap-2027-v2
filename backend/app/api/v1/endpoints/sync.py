import json
import uuid
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Request, Response, HTTPException, status, BackgroundTasks
from pydantic import ValidationError

from app.schemas.sync import IncidentSyncRequest, IncidentSyncResponse
from app.schemas.missing_person import MissingPersonReportCreate, FoundPersonReportCreate
from app.schemas.emergency import EmergencyReportCreate
from app.schemas.crowd import CrowdReportCreate
from app.db.session import get_db_immediate
from app.core.security import (
    validate_phone,
    mask_phone,
    mask_name,
    generate_secure_tracking_token,
)
from app.services.whatsapp_service import dispatch_whatsapp_notification

router = APIRouter(tags=["Offline Incident Synchronization"])

def compute_payload_hash(payload: Dict[str, Any]) -> str:
    """
    Computes deterministic SHA-256 hash of the canonical JSON request payload.
    Ensures identical keys and values produce identical hashes regardless of dict ordering.
    """
    canonical_json = json.dumps(payload, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    return hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()

@router.post("/sync", response_model=IncidentSyncResponse, status_code=status.HTTP_201_CREATED)
def sync_incident(
    sync_req: IncidentSyncRequest,
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks = None
):
    """
    Universal offline synchronization endpoint for all four Pushkaralu incident types:
    - missing_person
    - found_person
    - emergency
    - crowd

    Guarantees idempotency via SHA-256 payload hashing and SQLite BEGIN IMMEDIATE transactions:
    - First submission: Returns HTTP 201 Created and persists incident + idempotency record.
    - Identical retry (lost response recovery): Returns HTTP 200 OK with duplicate_suppressed: True.
    - Altered payload with reused key: Returns HTTP 409 Conflict.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    payload_hash = compute_payload_hash(sync_req.payload)

    # 1. Pydantic validation according to incident type
    try:
        if sync_req.incident_type == "missing_person":
            parsed_report = MissingPersonReportCreate(**sync_req.payload)
        elif sync_req.incident_type == "found_person":
            parsed_report = FoundPersonReportCreate(**sync_req.payload)
        elif sync_req.incident_type == "emergency":
            parsed_report = EmergencyReportCreate(**sync_req.payload)
        elif sync_req.incident_type == "crowd":
            parsed_report = CrowdReportCreate(**sync_req.payload)
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unsupported incident type: '{sync_req.incident_type}'"
            )
    except ValidationError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=ve.errors()
        )

    # 2. Acquire immediate write transaction lock to serialize concurrent sync submissions
    with get_db_immediate() as conn:
        cursor = conn.cursor()

        # Check existing idempotency key
        cursor.execute("""
            SELECT idempotency_key, incident_type, incident_id, request_hash, tracking_token, response_payload, created_at
            FROM idempotency_keys
            WHERE idempotency_key = ?
        """, (sync_req.idempotency_key,))
        existing = cursor.fetchone()

        if existing:
            # Idempotency key already committed
            if existing["request_hash"] != payload_hash:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Idempotency key reused with altered payload"
                )

            # Identical retry: return original response payload
            response.status_code = status.HTTP_200_OK
            stored_data = json.loads(existing["response_payload"])
            return IncidentSyncResponse(
                idempotency_key=existing["idempotency_key"],
                incident_type=existing["incident_type"],
                incident_id=existing["incident_id"],
                tracking_token=existing["tracking_token"],
                status="committed",
                duplicate_suppressed=True,
                message="Duplicate request detected; returning original committed response.",
                data=stored_data
            )

        # 3. Fresh submission: commit to target incident table and audit log
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        if sync_req.incident_type == "missing_person":
            validated_phone = validate_phone(parsed_report.contact_phone)
            report_id = f"MIS-{uuid.uuid4().hex[:8].upper()}"
            tracking_token = generate_secure_tracking_token("MIS-TRK")

            cursor.execute("""
                INSERT INTO missing_person_reports (
                    id, person_name, age, gender, description, last_seen_location,
                    last_seen_time, clothing_details, contact_phone, contact_name,
                    relationship, status, reported_at, ip_address, tracking_token
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
            """, (
                report_id, parsed_report.person_name, parsed_report.age, parsed_report.gender,
                parsed_report.description, parsed_report.last_seen_location, parsed_report.last_seen_time,
                parsed_report.clothing_details, validated_phone, parsed_report.contact_name,
                parsed_report.relationship, now_str, client_ip, tracking_token
            ))

            cursor.execute("""
                INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
                VALUES (?, ?, ?, ?, ?)
            """, (
                "missing_person", report_id, "OFFLINE_SYNC_CREATED",
                f"Synced: {parsed_report.person_name}, Age: {parsed_report.age}, Key: {sync_req.idempotency_key}",
                f"sync_ip:{client_ip}"
            ))

            response_data = {
                "id": report_id,
                "person_name": parsed_report.person_name,
                "age": parsed_report.age,
                "gender": parsed_report.gender,
                "description": parsed_report.description,
                "last_seen_location": parsed_report.last_seen_location,
                "last_seen_time": parsed_report.last_seen_time,
                "clothing_details": parsed_report.clothing_details,
                "contact_phone_masked": mask_phone(validated_phone),
                "contact_name_masked": mask_name(parsed_report.contact_name),
                "tracking_token": tracking_token,
                "status": "active",
                "reported_at": now_str
            }

        elif sync_req.incident_type == "found_person":
            validated_phone = validate_phone(parsed_report.finder_contact_phone)
            report_id = f"FND-{uuid.uuid4().hex[:8].upper()}"
            tracking_token = generate_secure_tracking_token("FND-TRK")

            cursor.execute("""
                INSERT INTO found_person_reports (
                    id, approximate_age, gender, appearance_description,
                    current_safekeeping_location, finder_contact_phone, finder_name,
                    status, reported_at, ip_address, tracking_token
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'under_care', ?, ?, ?)
            """, (
                report_id, parsed_report.approximate_age, parsed_report.gender,
                parsed_report.appearance_description, parsed_report.current_safekeeping_location,
                validated_phone, parsed_report.finder_name, now_str, client_ip, tracking_token
            ))

            cursor.execute("""
                INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
                VALUES (?, ?, ?, ?, ?)
            """, (
                "found_person", report_id, "OFFLINE_SYNC_CREATED",
                f"Synced found person: {parsed_report.approximate_age}, Location: {parsed_report.current_safekeeping_location}, Key: {sync_req.idempotency_key}",
                f"sync_ip:{client_ip}"
            ))

            response_data = {
                "id": report_id,
                "approximate_age": parsed_report.approximate_age,
                "gender": parsed_report.gender,
                "appearance_description": parsed_report.appearance_description,
                "current_safekeeping_location": parsed_report.current_safekeeping_location,
                "finder_name_masked": mask_name(parsed_report.finder_name),
                "tracking_token": tracking_token,
                "status": "under_care",
                "reported_at": now_str
            }

        elif sync_req.incident_type == "emergency":
            validated_phone = validate_phone(parsed_report.contact_phone)
            report_id = f"EMG-{uuid.uuid4().hex[:8].upper()}"
            tracking_token = generate_secure_tracking_token("EMG-TRK")

            cursor.execute("""
                INSERT INTO emergency_reports (
                    id, incident_type, severity, landmark, latitude, longitude,
                    contact_phone, details, status, reported_at, ip_address, tracking_token
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?, ?)
            """, (
                report_id, parsed_report.incident_type, parsed_report.severity, parsed_report.landmark,
                parsed_report.latitude, parsed_report.longitude, validated_phone, parsed_report.details,
                now_str, client_ip, tracking_token
            ))

            cursor.execute("""
                INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
                VALUES (?, ?, ?, ?, ?)
            """, (
                "emergency", report_id, "OFFLINE_SYNC_CREATED",
                f"Synced emergency: {parsed_report.incident_type}, Severity: {parsed_report.severity}, Key: {sync_req.idempotency_key}",
                f"sync_ip:{client_ip}"
            ))

            response_data = {
                "id": report_id,
                "incident_type": parsed_report.incident_type,
                "severity": parsed_report.severity,
                "landmark": parsed_report.landmark,
                "latitude": parsed_report.latitude,
                "longitude": parsed_report.longitude,
                "status": "received",
                "tracking_token": tracking_token,
                "reported_at": now_str
            }

        elif sync_req.incident_type == "crowd":
            report_id = f"CRW-{uuid.uuid4().hex[:8].upper()}"
            tracking_token = None

            cursor.execute("""
                INSERT INTO crowd_reports (
                    id, location_name, latitude, longitude, congestion_level,
                    reported_wait_minutes, comments, reported_at, ip_address, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                report_id, parsed_report.location_name, parsed_report.latitude, parsed_report.longitude,
                parsed_report.congestion_level, parsed_report.reported_wait_minutes or 0,
                parsed_report.comments, now_str, client_ip
            ))

            cursor.execute("""
                INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
                VALUES (?, ?, ?, ?, ?)
            """, (
                "crowd", report_id, "OFFLINE_SYNC_CREATED",
                f"Synced crowd: {parsed_report.congestion_level} at {parsed_report.location_name}, Key: {sync_req.idempotency_key}",
                f"sync_ip:{client_ip}"
            ))

            response_data = {
                "id": report_id,
                "location_name": parsed_report.location_name,
                "latitude": parsed_report.latitude,
                "longitude": parsed_report.longitude,
                "congestion_level": parsed_report.congestion_level,
                "reported_wait_minutes": parsed_report.reported_wait_minutes or 0,
                "comments": parsed_report.comments,
                "status": "active",
                "reported_at": now_str
            }

        # 4. Insert into idempotency_keys table (enforced by polymorphic integrity trigger)
        serialized_payload = json.dumps(response_data, sort_keys=True)
        cursor.execute("""
            INSERT INTO idempotency_keys (
                idempotency_key, incident_type, incident_id, request_hash, tracking_token, response_payload
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            sync_req.idempotency_key, sync_req.incident_type, report_id,
            payload_hash, tracking_token, serialized_payload
        ))

    # 5. Non-blocking decoupled WhatsApp notification simulation for missing/found reports
    if sync_req.incident_type in ("missing_person", "found_person"):
        try:
            notification_data = dict(response_data)
            if sync_req.incident_type == "missing_person":
                notification_data["contact_phone"] = sync_req.payload.get("contact_phone")
                notification_data["contact_name"] = sync_req.payload.get("contact_name")
            else:
                notification_data["finder_contact_phone"] = sync_req.payload.get("finder_contact_phone")
                notification_data["finder_name"] = sync_req.payload.get("finder_name")
            
            if background_tasks:
                background_tasks.add_task(dispatch_whatsapp_notification, sync_req.incident_type, notification_data)
            else:
                dispatch_whatsapp_notification(sync_req.incident_type, notification_data)
        except Exception:
            pass  # Simulation failure never aborts committed incident

    response.status_code = status.HTTP_201_CREATED
    return IncidentSyncResponse(
        idempotency_key=sync_req.idempotency_key,
        incident_type=sync_req.incident_type,
        incident_id=report_id,
        tracking_token=tracking_token,
        status="committed",
        duplicate_suppressed=False,
        message=f"Incident report committed successfully via offline sync [{report_id}].",
        data=response_data
    )
