import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Request, HTTPException, status
from app.schemas.emergency import (
    EmergencyReportCreate,
    EmergencyReportResponse,
    EmergencyStatusResponse,
    EmergencyContactsResponse,
    HotlineInfo,
)
from app.db.session import get_db
from app.core.security import (
    validate_phone,
    generate_secure_tracking_token,
    check_rate_limit,
    check_duplicate_report,
    register_report_fingerprint,
)

router = APIRouter(prefix="/emergency", tags=["Emergency Services"])

OFFICIAL_HOTLINES = [
    HotlineInfo(
        service_name="National Emergency Support (Police/Fire/Rescue)",
        phone_number="112",
        description="Unified national emergency response hotline (Police, Fire, Disaster Response).",
        is_toll_free=True
    ),
    HotlineInfo(
        service_name="Free Ambulance & Medical Emergency",
        phone_number="108",
        description="Toll-free 24x7 emergency medical service and ambulance dispatch.",
        is_toll_free=True
    ),
    HotlineInfo(
        service_name="AP Disaster Management & Riverfront Rescue",
        phone_number="1070",
        description="State emergency operation center for river safety and flood response.",
        is_toll_free=True
    ),
    HotlineInfo(
        service_name="Women & Child Helpline",
        phone_number="181",
        description="Immediate assistance, safety support, and distress response.",
        is_toll_free=True
    ),
]

ON_SITE_HELPDESKS = [
    HotlineInfo(
        service_name="Pushkar Ghat Central Control Room",
        phone_number="+91 883 2460100",
        description="On-ground Pushkaralu police control room & festival coordination desk.",
        is_toll_free=False
    ),
    HotlineInfo(
        service_name="Kotilingala Ghat Emergency Post",
        phone_number="+91 883 2460101",
        description="First-aid medical booth, life-saving swimmers, and missing persons post.",
        is_toll_free=False
    ),
    HotlineInfo(
        service_name="Saraswathi Ghat Medical Camp",
        phone_number="+91 883 2460102",
        description="Emergency triage center with doctors and oxygen support.",
        is_toll_free=False
    ),
]

ADVISORY_TEXT = (
    "CRITICAL NOTICE: For life-threatening emergencies, dial 112 (Police) or 108 (Ambulance) immediately. "
    "Digital submissions are recorded in the Pushkaralu Control Room incident intake queue for on-ground assistance "
    "and triage. This system does NOT claim automated dispatch or authorized replacement for official emergency services."
)

@router.get("/contacts", response_model=EmergencyContactsResponse)
def get_emergency_contacts():
    """Returns official verified emergency hotlines and Pushkaralu helpdesk telephone numbers."""
    return EmergencyContactsResponse(
        official_disclaimer=ADVISORY_TEXT,
        state_hotlines=OFFICIAL_HOTLINES,
        on_site_helpdesks=ON_SITE_HELPDESKS
    )

@router.post("/report", response_model=EmergencyReportResponse, status_code=status.HTTP_201_CREATED)
def submit_emergency_report(report: EmergencyReportCreate, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # 1. Rate Limiting: 5 submissions per 10 minutes
    if not check_rate_limit(client_ip, category="emergency", max_requests=5, window_seconds=600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit reached for emergency reports from this IP. If this is an immediate emergency, please call 112 or 108 directly."
        )

    # 2. Strict Phone Validation
    validated_phone = validate_phone(report.contact_phone)

    # 3. Duplicate Suppression (same phone + same landmark within 120s)
    fingerprint = f"emergency:{validated_phone}:{report.landmark.lower()}"
    existing_token = check_duplicate_report(fingerprint, window_seconds=120)
    if existing_token:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An emergency incident for '{report.landmark}' was already submitted recently. Existing tracking token: {existing_token}. For urgent dispatch, please call 112."
        )

    report_id = f"EMG-{uuid.uuid4().hex[:8].upper()}"
    tracking_token = generate_secure_tracking_token("EMG-TRK")
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO emergency_reports (
                id, incident_type, severity, landmark, latitude, longitude,
                contact_phone, details, status, reported_at, ip_address, tracking_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?, ?)
        """, (
            report_id, report.incident_type, report.severity, report.landmark,
            report.latitude, report.longitude, validated_phone, report.details,
            now_str, client_ip, tracking_token
        ))

        # Audit log
        cursor.execute("""
            INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
            VALUES (?, ?, ?, ?, ?)
        """, (
            "emergency", report_id, "CREATED",
            f"Type: {report.incident_type}, Severity: {report.severity}, Landmark: {report.landmark}",
            f"ip:{client_ip}"
        ))

    register_report_fingerprint(fingerprint, tracking_token)

    return EmergencyReportResponse(
        id=report_id,
        incident_type=report.incident_type,
        severity=report.severity,
        landmark=report.landmark,
        status="received",
        reported_at=now_str,
        tracking_token=tracking_token,
        advisory_notice=ADVISORY_TEXT,
        direct_hotlines={
            "Police / National Emergency": "112",
            "Medical Ambulance": "108",
            "Riverfront Safety": "1070",
            "Control Room": "+91 883 2460100"
        }
    )

@router.get("/status/{tracking_token}", response_model=EmergencyStatusResponse)
def get_emergency_status(tracking_token: str):
    """Retrieves status of a submitted emergency report using its private tracking token."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, incident_type, severity, landmark, status, reported_at, dispatched_at
            FROM emergency_reports
            WHERE tracking_token = ?
        """, (tracking_token,))
        row = cursor.fetchone()
        
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency report not found with the provided tracking token."
        )

    return EmergencyStatusResponse(
        id=row["id"],
        incident_type=row["incident_type"],
        severity=row["severity"],
        landmark=row["landmark"],
        status=row["status"],
        reported_at=row["reported_at"],
        dispatched_at=row["dispatched_at"],
        advisory=ADVISORY_TEXT
    )
