from fastapi import APIRouter
from typing import Dict, Any
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health", response_model=Dict[str, Any])
def health_check() -> Dict[str, Any]:
    """
    Health check endpoint returning service status, timestamp, and challenge reference.
    """
    return {
        "status": "healthy",
        "service": "Godavari SmartMap 2027 API",
        "phase": "Phase 2 - Foundation Complete",
        "challenge": "AP Government Innovation Challenge PS-09",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "sqlite",
        "event": "Godavari Pushkaralu 2027"
    }
