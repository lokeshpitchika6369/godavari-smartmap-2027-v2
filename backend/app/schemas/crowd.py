from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator

CongestionLevel = Literal["low", "moderate", "high", "severe"]

class CrowdReportCreate(BaseModel):
    location_name: str = Field(..., min_length=2, max_length=120, description="Name of the ghat, gate, or promenade strip")
    latitude: float = Field(..., ge=16.85, le=17.20, description="Latitude within Godavari Pushkaralu riverfront")
    longitude: float = Field(..., ge=81.65, le=81.95, description="Longitude within Godavari Pushkaralu riverfront")
    congestion_level: CongestionLevel = Field(..., description="Observed crowd congestion density")
    reported_wait_minutes: Optional[int] = Field(default=0, ge=0, le=360, description="Estimated queue wait time in minutes")
    comments: Optional[str] = Field(default=None, max_length=300, description="Optional brief observation notes")

    @field_validator("location_name")
    def clean_location(cls, v: str) -> str:
        return v.strip()

class CrowdReportResponse(BaseModel):
    id: str
    location_name: str
    latitude: float
    longitude: float
    congestion_level: str
    reported_wait_minutes: int
    comments: Optional[str] = None
    reported_at: str
    message: str

class LocationDensityMetric(BaseModel):
    location_name: str
    report_count: int
    dominant_congestion_level: str
    average_wait_minutes: float
    latest_report_time: str

class CrowdDensitySummaryResponse(BaseModel):
    total_active_reports: int
    window_minutes: int
    locations: List[LocationDensityMetric]
