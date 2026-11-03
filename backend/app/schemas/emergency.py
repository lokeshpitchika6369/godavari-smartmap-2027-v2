from typing import Optional, List, Literal, Dict
from pydantic import BaseModel, Field, field_validator

EmergencyType = Literal["medical", "stampede_risk", "fire", "drowning_risk", "child_distress", "other"]
EmergencySeverity = Literal["critical", "high", "medium"]

class EmergencyReportCreate(BaseModel):
    incident_type: EmergencyType = Field(..., description="Nature of the emergency")
    severity: EmergencySeverity = Field(..., description="Severity level")
    landmark: str = Field(..., min_length=3, max_length=150, description="Closest ghat, gate, or pillar landmark")
    latitude: Optional[float] = Field(default=None, ge=16.85, le=17.20)
    longitude: Optional[float] = Field(default=None, ge=81.65, le=81.95)
    contact_phone: str = Field(..., min_length=10, max_length=15, description="Indian mobile number of the reporter or on-site witness")
    details: str = Field(..., min_length=5, max_length=1000, description="Factual description of the incident")

    @field_validator("details", "landmark")
    def clean_text(cls, v: str) -> str:
        return v.strip()

class EmergencyReportResponse(BaseModel):
    id: str
    incident_type: str
    severity: str
    landmark: str
    status: str
    reported_at: str
    tracking_token: str
    advisory_notice: str
    direct_hotlines: Dict[str, str]

class EmergencyStatusResponse(BaseModel):
    id: str
    incident_type: str
    severity: str
    landmark: str
    status: str
    reported_at: str
    dispatched_at: Optional[str] = None
    advisory: str

class HotlineInfo(BaseModel):
    service_name: str
    phone_number: str
    description: str
    is_toll_free: bool

class EmergencyContactsResponse(BaseModel):
    official_disclaimer: str
    state_hotlines: List[HotlineInfo]
    on_site_helpdesks: List[HotlineInfo]
