from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

Gender = Literal["male", "female", "other"]
FoundGender = Literal["male", "female", "other", "unknown"]

class MissingPersonReportCreate(BaseModel):
    person_name: str = Field(..., min_length=2, max_length=100, description="Full name of missing individual")
    age: int = Field(..., ge=0, le=120, description="Age of missing person in years")
    gender: Gender = Field(..., description="Gender")
    description: str = Field(..., min_length=10, max_length=1000, description="Physical traits, language, distinguishing marks")
    last_seen_location: str = Field(..., min_length=3, max_length=150, description="Ghat, stall, or landmark last seen at")
    last_seen_time: str = Field(..., min_length=3, max_length=100, description="Approximate time or context when separation occurred")
    clothing_details: Optional[str] = Field(default=None, max_length=300, description="Color of shirt, saree, dress, footwear")
    contact_phone: str = Field(..., min_length=10, max_length=15, description="Primary contact phone number of family member")
    contact_name: str = Field(..., min_length=2, max_length=100, description="Name of family member reporting")
    relationship: str = Field(..., min_length=2, max_length=50, description="e.g. Parent, Sibling, Spouse, Tour Leader")

    @field_validator("person_name", "contact_name", "last_seen_location")
    def clean_strings(cls, v: str) -> str:
        return v.strip()

class MissingPersonPublicResponse(BaseModel):
    id: str
    person_name: str
    age: int
    gender: str
    description: str
    last_seen_location: str
    last_seen_time: str
    clothing_details: Optional[str] = None
    status: str
    reported_at: str
    contact_phone_masked: str
    contact_name_masked: str
    helpdesk_contact: str = "Pushkaralu Lost & Found Central Booth: +91 883 2460100"

class MissingPersonPrivateResponse(BaseModel):
    id: str
    person_name: str
    age: int
    gender: str
    description: str
    last_seen_location: str
    last_seen_time: str
    clothing_details: Optional[str] = None
    contact_phone: str
    contact_name: str
    relationship: str
    status: str
    reported_at: str
    tracking_token: str
    message: str
    notification_status: str = "SIMULATED"
    notification_notice: str = "Announcement Booth Alert: Logged (Simulation Mode - No external message sent)"

class FoundPersonReportCreate(BaseModel):
    approximate_age: str = Field(..., min_length=1, max_length=30, description="e.g. 'Child (~5 yrs)', 'Elderly (~70 yrs)'")
    gender: FoundGender = Field(..., description="Observed gender")
    appearance_description: str = Field(..., min_length=10, max_length=1000, description="Clothing, language spoken, visible condition")
    current_safekeeping_location: str = Field(..., min_length=3, max_length=150, description="Specific Help Desk, Police Outpost, or Ghat Booth")
    finder_contact_phone: str = Field(..., min_length=10, max_length=15, description="Contact phone of good samaritan or volunteer")
    finder_name: str = Field(..., min_length=2, max_length=100, description="Name of finder or on-duty volunteer")

class FoundPersonPublicResponse(BaseModel):
    id: str
    approximate_age: str
    gender: str
    appearance_description: str
    current_safekeeping_location: str
    status: str
    reported_at: str
    finder_name_masked: str
    action_notice: str = "If you recognize this person, proceed directly to the designated Help Desk or contact the Pushkaralu Control Room."
    notification_status: str = "SIMULATED"
    notification_notice: str = "Announcement Booth Alert: Logged (Simulation Mode - No external message sent)"
