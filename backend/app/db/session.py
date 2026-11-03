import sqlite3
import os
from contextlib import contextmanager
from app.core.config import settings

def get_db_path() -> str:
    # Resolve relative to backend directory
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    return os.path.join(base_dir, settings.DB_PATH)

def init_db():
    """Initializes SQLite database schemas for Phase 5 services."""
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Enable Write-Ahead Logging (WAL) for concurrent read/write performance
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    
    # 1. Crowd Congestion Reports
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crowd_reports (
        id TEXT PRIMARY KEY,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        congestion_level TEXT NOT NULL CHECK(congestion_level IN ('low', 'moderate', 'high', 'severe')),
        reported_wait_minutes INTEGER DEFAULT 0,
        comments TEXT,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 2. Emergency Incident Reports
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_reports (
        id TEXT PRIMARY KEY,
        incident_type TEXT NOT NULL CHECK(incident_type IN ('medical', 'stampede_risk', 'fire', 'drowning_risk', 'child_distress', 'other')),
        severity TEXT NOT NULL CHECK(severity IN ('critical', 'high', 'medium')),
        landmark TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        contact_phone TEXT NOT NULL,
        details TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received', 'escalated_to_helpdesk', 'in_progress', 'resolved', 'false_alarm')),
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dispatched_at TIMESTAMP,
        ip_address TEXT,
        tracking_token TEXT NOT NULL UNIQUE
    );
    """)

    # 3. Missing Person Reports
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS missing_person_reports (
        id TEXT PRIMARY KEY,
        person_name TEXT NOT NULL,
        age INTEGER NOT NULL CHECK(age >= 0 AND age <= 120),
        gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
        description TEXT NOT NULL,
        last_seen_location TEXT NOT NULL,
        last_seen_time TEXT NOT NULL,
        clothing_details TEXT,
        contact_phone TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'located', 'reunited', 'closed')),
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        ip_address TEXT,
        tracking_token TEXT NOT NULL UNIQUE
    );
    """)

    # 4. Found Person Reports
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS found_person_reports (
        id TEXT PRIMARY KEY,
        approximate_age TEXT NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other', 'unknown')),
        appearance_description TEXT NOT NULL,
        current_safekeeping_location TEXT NOT NULL,
        finder_contact_phone TEXT NOT NULL,
        finder_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'under_care' CHECK(status IN ('under_care', 'matched', 'reunited', 'transferred_to_police')),
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        tracking_token TEXT NOT NULL UNIQUE
    );
    """)

    # 5. Incident Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incident_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_type TEXT NOT NULL,
        incident_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        actor TEXT NOT NULL DEFAULT 'public_submission',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. WhatsApp Notification Logs (Simulation & Meta Cloud API)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS whatsapp_notification_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_type TEXT NOT NULL,
        incident_id TEXT NOT NULL,
        recipient_phone_masked TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('SIMULATED', 'QUEUED', 'DELIVERED', 'FAILED')),
        simulated_message_id TEXT,
        template_name TEXT,
        rendered_content TEXT,
        error_details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 7. Idempotency Keys for Universal Offline Synchronization (Phase 4.3)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS idempotency_keys (
        idempotency_key TEXT PRIMARY KEY,
        incident_type TEXT NOT NULL CHECK(incident_type IN ('missing_person', 'found_person', 'emergency', 'crowd')),
        incident_id TEXT NOT NULL,
        request_hash TEXT NOT NULL,
        tracking_token TEXT,
        response_payload TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotency_key_unique 
    ON idempotency_keys(idempotency_key);
    """)

    # 8. Polymorphic Referential Integrity Verification Trigger
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_idempotency_verify_insert
    BEFORE INSERT ON idempotency_keys
    BEGIN
        SELECT CASE
            WHEN NEW.incident_type = 'missing_person' AND NOT EXISTS (SELECT 1 FROM missing_person_reports WHERE id = NEW.incident_id)
                THEN RAISE(ABORT, 'Referential Integrity Violation: Target missing_person report does not exist.')
            WHEN NEW.incident_type = 'found_person' AND NOT EXISTS (SELECT 1 FROM found_person_reports WHERE id = NEW.incident_id)
                THEN RAISE(ABORT, 'Referential Integrity Violation: Target found_person report does not exist.')
            WHEN NEW.incident_type = 'emergency' AND NOT EXISTS (SELECT 1 FROM emergency_reports WHERE id = NEW.incident_id)
                THEN RAISE(ABORT, 'Referential Integrity Violation: Target emergency report does not exist.')
            WHEN NEW.incident_type = 'crowd' AND NOT EXISTS (SELECT 1 FROM crowd_reports WHERE id = NEW.incident_id)
                THEN RAISE(ABORT, 'Referential Integrity Violation: Target crowd report does not exist.')
        END;
    END;
    """)

    # 9. Polymorphic Cascade Delete Triggers
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_missing_person_cascade_delete
    AFTER DELETE ON missing_person_reports
    BEGIN
        DELETE FROM idempotency_keys WHERE incident_type = 'missing_person' AND incident_id = OLD.id;
    END;
    """)

    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_found_person_cascade_delete
    AFTER DELETE ON found_person_reports
    BEGIN
        DELETE FROM idempotency_keys WHERE incident_type = 'found_person' AND incident_id = OLD.id;
    END;
    """)

    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_emergency_cascade_delete
    AFTER DELETE ON emergency_reports
    BEGIN
        DELETE FROM idempotency_keys WHERE incident_type = 'emergency' AND incident_id = OLD.id;
    END;
    """)

    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_crowd_cascade_delete
    AFTER DELETE ON crowd_reports
    BEGIN
        DELETE FROM idempotency_keys WHERE incident_type = 'crowd' AND incident_id = OLD.id;
    END;
    """)

    # 10. Primary Key Immutability Triggers
    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_missing_person_restrict_id_update
    BEFORE UPDATE OF id ON missing_person_reports
    BEGIN
        SELECT RAISE(ABORT, 'Primary Key Violation: Incident id is immutable once committed.');
    END;
    """)

    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_found_person_restrict_id_update
    BEFORE UPDATE OF id ON found_person_reports
    BEGIN
        SELECT RAISE(ABORT, 'Primary Key Violation: Incident id is immutable once committed.');
    END;
    """)

    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_emergency_restrict_id_update
    BEFORE UPDATE OF id ON emergency_reports
    BEGIN
        SELECT RAISE(ABORT, 'Primary Key Violation: Incident id is immutable once committed.');
    END;
    """)

    cursor.execute("""
    CREATE TRIGGER IF NOT EXISTS trg_crowd_restrict_id_update
    BEFORE UPDATE OF id ON crowd_reports
    BEGIN
        SELECT RAISE(ABORT, 'Primary Key Violation: Incident id is immutable once committed.');
    END;
    """)
    
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    """Context manager for SQLite connections with Row factory and automatic commit."""
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

@contextmanager
def get_db_immediate():
    """
    Context manager for SQLite connections with immediate write locking (BEGIN IMMEDIATE).
    Guarantees write serialization, preventing database lock race conditions.
    """
    db_path = get_db_path()
    conn = sqlite3.connect(db_path, timeout=5.0)
    conn.row_factory = sqlite3.Row
    conn.isolation_level = None  # Autocommit disabled so we manage transactions explicitly
    cursor = conn.cursor()
    cursor.execute("BEGIN IMMEDIATE;")
    try:
        yield conn
        cursor.execute("COMMIT;")
    except Exception:
        try:
            cursor.execute("ROLLBACK;")
        except Exception:
            pass
        raise
    finally:
        conn.close()
