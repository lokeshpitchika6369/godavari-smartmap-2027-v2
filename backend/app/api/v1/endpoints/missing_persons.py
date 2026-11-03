import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Request, HTTPException, status, BackgroundTasks
from app.schemas.missing_person import (
    MissingPersonReportCreate,
    MissingPersonPublicResponse,
    MissingPersonPrivateResponse,
    FoundPersonReportCreate,
    FoundPersonPublicResponse,
)
from app.db.session import get_db
from app.services.whatsapp_service import dispatch_whatsapp_notification
from app.core.security import (
    validate_phone,
    mask_phone,
    mask_name,
    generate_secure_tracking_token,
    check_rate_limit,
    check_duplicate_report,
    register_report_fingerprint,
)

router = APIRouter(tags=["Missing & Found Persons"])

# --- MISSING PERSONS ---

@router.post("/missing-persons/report", response_model=MissingPersonPrivateResponse, status_code=status.HTTP_201_CREATED)
def submit_missing_person_report(
    report: MissingPersonReportCreate,
    request: Request,
    background_tasks: BackgroundTasks = None
):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Rate Limiting: 5 submissions per 10 minutes
    if not check_rate_limit(client_ip, category="missing_person", max_requests=5, window_seconds=600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit reached for missing person registrations from this IP. Please visit the nearest Pushkaralu Lost & Found Desk directly."
        )

    # 2. Strict Phone Validation
    validated_phone = validate_phone(report.contact_phone)

    # 3. Duplicate Suppression
    fingerprint = f"missing:{validated_phone}:{report.person_name.lower().strip()}"
    existing_token = check_duplicate_report(fingerprint, window_seconds=120)
    if existing_token:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A missing person report for '{report.person_name}' was already registered. Tracking token: {existing_token}"
        )

    report_id = f"MIS-{uuid.uuid4().hex[:8].upper()}"
    tracking_token = generate_secure_tracking_token("MIS-TRK")
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO missing_person_reports (
                id, person_name, age, gender, description, last_seen_location,
                last_seen_time, clothing_details, contact_phone, contact_name,
                relationship, status, reported_at, ip_address, tracking_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
        """, (
            report_id, report.person_name, report.age, report.gender,
            report.description, report.last_seen_location, report.last_seen_time,
            report.clothing_details, validated_phone, report.contact_name,
            report.relationship, now_str, client_ip, tracking_token
        ))

        # Audit log
        cursor.execute("""
            INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
            VALUES (?, ?, ?, ?, ?)
        """, (
            "missing_person", report_id, "CREATED",
            f"Person: {report.person_name}, Age: {report.age}, Location: {report.last_seen_location}",
            f"ip:{client_ip}"
        ))

    register_report_fingerprint(fingerprint, tracking_token)

    # Decoupled notification dispatch (Simulation Mode)
    incident_data = {
        "id": report_id,
        "person_name": report.person_name,
        "age": report.age,
        "gender": report.gender,
        "description": report.description,
        "last_seen_location": report.last_seen_location,
        "last_seen_time": report.last_seen_time,
        "clothing_details": report.clothing_details,
        "contact_phone": validated_phone,
        "contact_name": report.contact_name,
        "relationship": report.relationship,
    }
    if background_tasks:
        background_tasks.add_task(dispatch_whatsapp_notification, "missing_person", incident_data)
    else:
        dispatch_whatsapp_notification("missing_person", incident_data)

    return MissingPersonPrivateResponse(
        id=report_id,
        person_name=report.person_name,
        age=report.age,
        gender=report.gender,
        description=report.description,
        last_seen_location=report.last_seen_location,
        last_seen_time=report.last_seen_time,
        clothing_details=report.clothing_details,
        contact_phone=validated_phone,
        contact_name=report.contact_name,
        relationship=report.relationship,
        status="active",
        reported_at=now_str,
        tracking_token=tracking_token,
        message="Missing person report successfully registered with the Central Lost & Found Control Desk."
    )

@router.get("/missing-persons/active", response_model=List[MissingPersonPublicResponse])
def get_active_missing_persons():
    """
    Public bulletin feed of active missing persons.
    CRITICAL PRIVACY SAFEGUARD: All reporter contact numbers and names are masked to protect PII.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, person_name, age, gender, description, last_seen_location,
                   last_seen_time, clothing_details, status, reported_at, contact_phone, contact_name
            FROM missing_person_reports
            WHERE status = 'active'
            ORDER BY reported_at DESC
            LIMIT 50
        """)
        rows = cursor.fetchall()

    results: List[MissingPersonPublicResponse] = []
    for r in rows:
        results.append(MissingPersonPublicResponse(
            id=r["id"],
            person_name=r["person_name"],
            age=r["age"],
            gender=r["gender"],
            description=r["description"],
            last_seen_location=r["last_seen_location"],
            last_seen_time=r["last_seen_time"],
            clothing_details=r["clothing_details"],
            status=r["status"],
            reported_at=r["reported_at"],
            contact_phone_masked=mask_phone(r["contact_phone"]),
            contact_name_masked=mask_name(r["contact_name"])
        ))
    return results

@router.get("/missing-persons/status/{tracking_token}", response_model=MissingPersonPrivateResponse)
def get_missing_person_private_status(tracking_token: str):
    """Access full report details using the private tracking token."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, person_name, age, gender, description, last_seen_location,
                   last_seen_time, clothing_details, contact_phone, contact_name,
                   relationship, status, reported_at, tracking_token
            FROM missing_person_reports
            WHERE tracking_token = ?
        """, (tracking_token,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Missing person report not found with the provided tracking token."
        )

    return MissingPersonPrivateResponse(
        id=row["id"],
        person_name=row["person_name"],
        age=row["age"],
        gender=row["gender"],
        description=row["description"],
        last_seen_location=row["last_seen_location"],
        last_seen_time=row["last_seen_time"],
        clothing_details=row["clothing_details"],
        contact_phone=row["contact_phone"],
        contact_name=row["contact_name"],
        relationship=row["relationship"],
        status=row["status"],
        reported_at=row["reported_at"],
        tracking_token=row["tracking_token"],
        message="Case active in Central Lost & Found Desk."
    )

# --- FOUND PERSONS ---

@router.post("/found-persons/report", response_model=FoundPersonPublicResponse, status_code=status.HTTP_201_CREATED)
def submit_found_person_report(
    report: FoundPersonReportCreate,
    request: Request,
    background_tasks: BackgroundTasks = None
):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # Rate Limiting: 5 per 10 minutes
    if not check_rate_limit(client_ip, category="found_person", max_requests=5, window_seconds=600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit reached for found person registrations from this IP."
        )

    validated_phone = validate_phone(report.finder_contact_phone)

    fingerprint = f"found:{validated_phone}:{report.current_safekeeping_location.lower().strip()}"
    existing_token = check_duplicate_report(fingerprint, window_seconds=120)
    if existing_token:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A found person report for this location was already submitted. Tracking token: {existing_token}"
        )

    report_id = f"FND-{uuid.uuid4().hex[:8].upper()}"
    tracking_token = generate_secure_tracking_token("FND-TRK")
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO found_person_reports (
                id, approximate_age, gender, appearance_description,
                current_safekeeping_location, finder_contact_phone, finder_name,
                status, reported_at, ip_address, tracking_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'under_care', ?, ?, ?)
        """, (
            report_id, report.approximate_age, report.gender,
            report.appearance_description, report.current_safekeeping_location,
            validated_phone, report.finder_name, now_str, client_ip, tracking_token
        ))

        cursor.execute("""
            INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
            VALUES (?, ?, ?, ?, ?)
        """, (
            "found_person", report_id, "CREATED",
            f"Location: {report.current_safekeeping_location}, Approx Age: {report.approximate_age}",
            f"ip:{client_ip}"
        ))

    register_report_fingerprint(fingerprint, tracking_token)

    # Decoupled notification dispatch (Simulation Mode)
    found_data = {
        "id": report_id,
        "approximate_age": report.approximate_age,
        "gender": report.gender,
        "appearance_description": report.appearance_description,
        "current_safekeeping_location": report.current_safekeeping_location,
        "finder_name": report.finder_name,
        "finder_contact_phone": validated_phone,
    }
    if background_tasks:
        background_tasks.add_task(dispatch_whatsapp_notification, "found_person", found_data)
    else:
        dispatch_whatsapp_notification("found_person", found_data)

    return FoundPersonPublicResponse(
        id=report_id,
        approximate_age=report.approximate_age,
        gender=report.gender,
        appearance_description=report.appearance_description,
        current_safekeeping_location=report.current_safekeeping_location,
        status="under_care",
        reported_at=now_str,
        finder_name_masked=mask_name(report.finder_name)
    )

@router.get("/found-persons/active", response_model=List[FoundPersonPublicResponse])
def get_active_found_persons():
    """
    Public bulletin feed of individuals currently in custody of official help desks.
    Finder phone is redacted; public is directed to the designated safe booth.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, approximate_age, gender, appearance_description,
                   current_safekeeping_location, status, reported_at, finder_name
            FROM found_person_reports
            WHERE status = 'under_care'
            ORDER BY reported_at DESC
            LIMIT 50
        """)
        rows = cursor.fetchall()

    results: List[FoundPersonPublicResponse] = []
    for r in rows:
        results.append(FoundPersonPublicResponse(
            id=r["id"],
            approximate_age=r["approximate_age"],
            gender=r["gender"],
            appearance_description=r["appearance_description"],
            current_safekeeping_location=r["current_safekeeping_location"],
            status=r["status"],
            reported_at=r["reported_at"],
            finder_name_masked=mask_name(r["finder_name"])
        ))
    return results
