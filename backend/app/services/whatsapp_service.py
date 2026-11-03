import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.security import mask_phone
from app.db.session import get_db

logger = logging.getLogger("whatsapp_service")

def format_missing_person_alert(data: Dict[str, Any]) -> str:
    """
    Formats minimal-information alert for Central Announcement Booth PA operators.
    Strictly excludes sensitive details, family names, contact phones, and full identities.
    """
    age = data.get("age")
    urgency = data.get("urgency")
    if not urgency:
        if age is not None and isinstance(age, int) and age < 12:
            urgency = "CRITICAL (Child)"
        elif age is not None and isinstance(age, int) and age >= 60:
            urgency = "HIGH (Senior Citizen)"
        else:
            urgency = "HIGH"

    return (
        f"GODAVARI PUSKARALU 2027 — MISSING PERSON ALERT\n\n"
        f"Report ID: {data.get('id', 'N/A')}\n"
        f"Urgency: {urgency}\n"
        f"Last Seen Location: {data.get('last_seen_location', 'N/A')}\n"
        f"Approximate Time: {data.get('last_seen_time', 'N/A')}\n\n"
        f"Please check the report in the authorized SmartMap administration dashboard and coordinate assistance."
    )

def format_found_person_alert(data: Dict[str, Any]) -> str:
    """
    Formats minimal-information alert for Safe Care Booth announcements.
    Strictly excludes full names, finder phone numbers, and sensitive details.
    """
    return (
        f"GODAVARI PUSKARALU 2027 — FOUND PERSON ALERT\n\n"
        f"Report ID: {data.get('id', 'N/A')}\n"
        f"Approximate Age: {data.get('approximate_age', 'N/A')}\n"
        f"Safe Location / Helpdesk: {data.get('current_safekeeping_location', 'N/A')}\n\n"
        f"Please arrange verification and reunification through authorized personnel."
    )

def dispatch_whatsapp_notification(incident_type: str, incident_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Decoupled notification dispatch service.
    CRITICAL RESILIENCE GUARANTEE:
    - This function runs in the background AFTER the citizen report has already been committed to the database.
    - Any error or exception caught here is recorded to whatsapp_notification_logs as 'FAILED'
      and never re-raised. The saved citizen report is NEVER erased or affected.
    - Defaults to strict SIMULATION mode (no external network traffic).
    """
    incident_id = incident_data.get("id", "UNKNOWN")
    booth_phone = settings.WHATSAPP_ANNOUNCEMENT_BOOTH_PHONE or "+919182915631"
    masked_booth_phone = mask_phone(booth_phone)
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    # Format appropriate alert content
    if incident_type == "missing_person":
        template_name = "pushkaralu_missing_alert"
        content = format_missing_person_alert(incident_data)
    else:
        template_name = "pushkaralu_found_alert"
        content = format_found_person_alert(incident_data)

    try:
        if settings.WHATSAPP_PROVIDER == "simulation":
            sim_id = f"sim_wa_{uuid.uuid4().hex[:12]}"

            # Record simulated notification attempt in dedicated audit log
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO whatsapp_notification_logs (
                        incident_type, incident_id, recipient_phone_masked,
                        provider, status, simulated_message_id, template_name,
                        rendered_content, error_details, created_at
                    ) VALUES (?, ?, ?, 'simulation', 'SIMULATED', ?, ?, ?, NULL, ?)
                """, (
                    incident_type, incident_id, masked_booth_phone,
                    sim_id, template_name, content, now_str
                ))

            logger.info(
                f"[SIMULATION] WhatsApp alert recorded for Announcement Booth ({masked_booth_phone}). "
                f"Incident: {incident_id}. Simulated ID: {sim_id}. Real WhatsApp message NOT sent."
            )

            return {
                "status": "SIMULATED",
                "simulated_message_id": sim_id,
                "provider": "simulation",
                "recipient_masked": masked_booth_phone,
                "notice": "Simulation mode: WhatsApp alert recorded in control room audit queue. Real external message not sent."
            }

        else:
            # Future live provider branch (Phase C)
            logger.warning(f"Unsupported WhatsApp provider '{settings.WHATSAPP_PROVIDER}'. Falling back to simulation.")
            return {
                "status": "SIMULATED",
                "provider": "unconfigured_fallback",
                "notice": "No live provider configured; alert logged in simulation mode."
            }

    except Exception as exc:
        # Non-destructive failure isolation
        error_msg = f"Notification processing failed: {str(exc)}"
        logger.error(f"[NOTIFICATION ERROR] {error_msg} for Incident: {incident_id}")
        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO whatsapp_notification_logs (
                        incident_type, incident_id, recipient_phone_masked,
                        provider, status, simulated_message_id, template_name,
                        rendered_content, error_details, created_at
                    ) VALUES (?, ?, ?, ?, 'FAILED', NULL, ?, ?, ?, ?)
                """, (
                    incident_type, incident_id, masked_booth_phone,
                    settings.WHATSAPP_PROVIDER, template_name, content, error_msg, now_str
                ))
        except Exception:
            # If DB log itself fails, do not crash application
            pass

        return {
            "status": "FAILED",
            "error": error_msg,
            "notice": "Notification failed, but the citizen report remains safely recorded."
        }
