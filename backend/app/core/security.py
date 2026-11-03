import re
import secrets
import time
from typing import Dict, List, Tuple, Optional
from fastapi import HTTPException, Security, Request, status
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings

# Indian Mobile Regex: Optional +91 or 91 prefix, followed by 6-9 and 9 digits
PHONE_REGEX = re.compile(r"^(?:\+91[\-\s]?|91[\-\s]?)?[6-9]\d{9}$")

def validate_phone(phone: str) -> str:
    """Validates and standardizes Indian phone numbers."""
    cleaned = re.sub(r"[\s\-\(\)]", "", phone.strip())
    if not PHONE_REGEX.match(cleaned):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid phone number. Must be a valid 10-digit Indian mobile number (+91XXXXXXXXXX or XXXXXXXXXX)."
        )
    # Standardize to 10 digits or +91 prefix
    if cleaned.startswith("+91"):
        return cleaned
    elif cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    elif len(cleaned) == 10:
        return f"+91{cleaned}"
    return cleaned

def mask_phone(phone: str) -> str:
    """Masks phone number for public feeds (e.g., +91 98****1234)."""
    clean = re.sub(r"\s+", "", phone)
    if len(clean) >= 10:
        prefix = clean[:5]
        suffix = clean[-4:]
        return f"{prefix}****{suffix}"
    return "****"

def mask_name(name: str) -> str:
    """Masks name for public privacy (e.g. Ramesh Kumar -> R. Kumar)."""
    parts = name.strip().split()
    if len(parts) >= 2:
        return f"{parts[0][0]}. {' '.join(parts[1:])}"
    elif len(parts) == 1 and len(parts[0]) > 2:
        return f"{parts[0][0]}***{parts[0][-1]}"
    return name

def generate_secure_tracking_token(prefix: str = "TRK") -> str:
    """Generates high-entropy cryptographic tracking token for report tracking."""
    token_entropy = secrets.token_urlsafe(16)
    return f"{prefix}-{token_entropy}"

# Sliding window rate limiter: { (client_ip, endpoint_category): [timestamps] }
_rate_limits: Dict[Tuple[str, str], List[float]] = {}

def check_rate_limit(client_ip: str, category: str, max_requests: int = 5, window_seconds: int = 600) -> bool:
    """Enforces sliding-window rate limit per IP per category."""
    now = time.time()
    key = (client_ip, category)
    timestamps = _rate_limits.get(key, [])
    # Filter out timestamps older than window
    timestamps = [ts for ts in timestamps if now - ts < window_seconds]
    if len(timestamps) >= max_requests:
        _rate_limits[key] = timestamps
        return False
    timestamps.append(now)
    _rate_limits[key] = timestamps
    return True

# Duplicate report suppression: { fingerprint_hash: (timestamp, tracking_token) }
_duplicate_cache: Dict[str, Tuple[float, str]] = {}

def check_duplicate_report(fingerprint: str, window_seconds: int = 120) -> Optional[str]:
    """
    Checks if an identical report was submitted recently.
    Returns existing tracking_token if duplicate, None otherwise.
    """
    now = time.time()
    if fingerprint in _duplicate_cache:
        cached_time, token = _duplicate_cache[fingerprint]
        if now - cached_time < window_seconds:
            return token
        else:
            del _duplicate_cache[fingerprint]
    return None

def register_report_fingerprint(fingerprint: str, tracking_token: str):
    """Registers a submission fingerprint to prevent duplicate spam."""
    _duplicate_cache[fingerprint] = (time.time(), tracking_token)

# Admin Authorization
api_key_header = APIKeyHeader(name="X-Admin-Key", auto_error=False)

def verify_admin_key(api_key: Optional[str] = Security(api_key_header)) -> bool:
    if not api_key or api_key != settings.ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Valid X-Admin-Key header required to access administrative audit trails."
        )
    return True
