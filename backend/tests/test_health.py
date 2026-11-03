import pytest
from app.main import root, app
from app.api.v1.endpoints.health import health_check

def test_root_endpoint():
    data = root()
    assert "Welcome to Godavari SmartMap 2027 API" in data["message"]
    assert data["docs"] == "/api/v1/docs"
    assert data["health"] == "/api/v1/health"

def test_health_check_endpoint():
    data = health_check()
    assert data["status"] == "healthy"
    assert data["service"] == "Godavari SmartMap 2027 API"
    assert data["phase"] == "Phase 2 - Foundation Complete"
    assert data["challenge"] == "AP Government Innovation Challenge PS-09"
    assert "timestamp" in data

def test_app_metadata():
    assert app.title == "Godavari SmartMap 2027 API"
    assert app.version == "1.0.0"
