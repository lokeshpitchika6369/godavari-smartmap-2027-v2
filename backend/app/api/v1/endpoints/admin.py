from typing import List, Optional
from fastapi import APIRouter, Depends
from app.schemas.audit import AuditLogResponse
from app.db.session import get_db
from app.core.security import verify_admin_key

router = APIRouter(prefix="/admin", tags=["Administration & Audit"])

@router.get("/audit-logs", response_model=List[AuditLogResponse], dependencies=[Depends(verify_admin_key)])
def get_incident_audit_logs(
    incident_type: Optional[str] = None,
    limit: int = 50
):
    """
    Administrative tamper-evident audit log query.
    Requires X-Admin-Key header with valid pushkaralu administrator credentials.
    """
    # Clean parameter if passed as FastAPI Query object
    clean_type = incident_type if isinstance(incident_type, str) else None
    clean_limit = limit if isinstance(limit, int) else 50

    with get_db() as conn:
        cursor = conn.cursor()
        if clean_type:
            cursor.execute("""
                SELECT id, incident_type, incident_id, action, details, actor, timestamp
                FROM incident_audit_logs
                WHERE incident_type = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (clean_type, clean_limit))
        else:
            cursor.execute("""
                SELECT id, incident_type, incident_id, action, details, actor, timestamp
                FROM incident_audit_logs
                ORDER BY timestamp DESC
                LIMIT ?
            """, (clean_limit,))
        rows = cursor.fetchall()

    return [
        AuditLogResponse(
            id=r["id"],
            incident_type=r["incident_type"],
            incident_id=r["incident_id"],
            action=r["action"],
            details=r["details"],
            actor=r["actor"],
            timestamp=r["timestamp"]
        )
        for r in rows
    ]
