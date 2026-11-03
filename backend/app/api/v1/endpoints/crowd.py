import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Request, HTTPException, status
from app.schemas.crowd import (
    CrowdReportCreate,
    CrowdReportResponse,
    CrowdDensitySummaryResponse,
    LocationDensityMetric,
)
from app.db.session import get_db
from app.core.security import check_rate_limit, check_duplicate_report, register_report_fingerprint

router = APIRouter(prefix="/crowd", tags=["Crowd Reporting"])

@router.post("/report", response_model=CrowdReportResponse, status_code=status.HTTP_201_CREATED)
def submit_crowd_report(report: CrowdReportCreate, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # 1. Rate Limiting: 10 submissions per 10 minutes
    if not check_rate_limit(client_ip, category="crowd", max_requests=10, window_seconds=600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded for crowd reporting. Please wait a few minutes before submitting another report."
        )
        
    # 2. Duplicate Detection
    fingerprint = f"crowd:{client_ip}:{report.location_name}:{report.congestion_level}"
    existing_token = check_duplicate_report(fingerprint, window_seconds=60)
    if existing_token:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A duplicate crowd report for '{report.location_name}' was recently received from your device."
        )

    report_id = f"CRW-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO crowd_reports (
                id, location_name, latitude, longitude, congestion_level,
                reported_wait_minutes, comments, reported_at, ip_address, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            report_id, report.location_name, report.latitude, report.longitude,
            report.congestion_level, report.reported_wait_minutes or 0,
            report.comments, now_str, client_ip
        ))
        
        # Audit log
        cursor.execute("""
            INSERT INTO incident_audit_logs (incident_type, incident_id, action, details, actor)
            VALUES (?, ?, ?, ?, ?)
        """, (
            "crowd", report_id, "CREATED",
            f"Congestion {report.congestion_level} at {report.location_name}",
            f"ip:{client_ip}"
        ))

    register_report_fingerprint(fingerprint, report_id)

    return CrowdReportResponse(
        id=report_id,
        location_name=report.location_name,
        latitude=report.latitude,
        longitude=report.longitude,
        congestion_level=report.congestion_level,
        reported_wait_minutes=report.reported_wait_minutes or 0,
        comments=report.comments,
        reported_at=now_str,
        message="Crowd report successfully recorded. Thank you for contributing real-time conditions."
    )

@router.get("/density-summary", response_model=CrowdDensitySummaryResponse)
def get_crowd_density_summary():
    """Aggregates crowd reports submitted within the last 60 minutes."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                location_name,
                COUNT(*) as report_count,
                AVG(reported_wait_minutes) as avg_wait,
                MAX(reported_at) as latest_time,
                congestion_level
            FROM crowd_reports
            WHERE is_active = 1
            GROUP BY location_name
            ORDER BY report_count DESC
            LIMIT 20
        """)
        rows = cursor.fetchall()
        
        metrics: List[LocationDensityMetric] = []
        total_reports = 0
        for r in rows:
            total_reports += r["report_count"]
            metrics.append(LocationDensityMetric(
                location_name=r["location_name"],
                report_count=r["report_count"],
                dominant_congestion_level=r["congestion_level"],
                average_wait_minutes=round(r["avg_wait"] or 0.0, 1),
                latest_report_time=r["latest_time"] or ""
            ))
            
    return CrowdDensitySummaryResponse(
        total_active_reports=total_reports,
        window_minutes=60,
        locations=metrics
    )
