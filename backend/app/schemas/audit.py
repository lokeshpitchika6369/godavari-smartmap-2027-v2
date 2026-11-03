from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: int
    incident_type: str
    incident_id: str
    action: str
    details: str
    actor: str
    timestamp: str
