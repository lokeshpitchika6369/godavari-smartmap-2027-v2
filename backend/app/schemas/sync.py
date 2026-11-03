from typing import Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

SyncIncidentType = Literal["missing_person", "found_person", "emergency", "crowd"]

class IncidentSyncRequest(BaseModel):
    idempotency_key: str = Field(..., min_length=16, max_length=128, description="Client-generated unique UUIDv4 key")
    incident_type: SyncIncidentType = Field(..., description="Target incident category")
    payload: Dict[str, Any] = Field(..., description="Raw incident report payload to be validated and committed")

class IncidentSyncResponse(BaseModel):
    idempotency_key: str
    incident_type: str
    incident_id: str
    tracking_token: Optional[str] = None
    status: str = "committed"
    duplicate_suppressed: bool = False
    message: str
    data: Dict[str, Any]
