from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid

class LogEntry(BaseModel):
    id: str
    timestamp: str # ISO 8601
    severity: str # INFO, WARNING, CRITICAL
    eventType: str # REGISTRATION, ENROLL, VERIFY_SUCCESS, VERIFY_FAIL, ACCESS_DENIED, LIVENESS_FAIL
    username: Optional[str] = None
    sourceIp: str
    details: str

class MetricSummary(BaseModel):
    total_auths_1h: int
    access_denied_24h: int
    active_threats: int
    threats_detected_24h: int
    timeline: List[Dict[str, Any]] = []

class AuditService:
    def __init__(self):
        self._logs: List[LogEntry] = []

    def log(self, event_type: str, severity: str, details: str, username: Optional[str] = None, source_ip: str = "SYSTEM"):
        """Record a new security event."""
        entry = LogEntry(
            id=str(uuid.uuid4()),
            timestamp=datetime.now().isoformat(),
            severity=severity,
            eventType=event_type,
            username=username,
            sourceIp=source_ip,
            details=details
        )
        self._logs.insert(0, entry) # Prepend for newest first
        # Limit log size for memory safety in this demo
        if len(self._logs) > 1000:
            self._logs.pop()
        
        print(f"[AUDIT] {entry.timestamp} | {severity} | {event_type} | {username} | {details}")
        return entry

    def get_logs(self, limit: int = 100) -> List[LogEntry]:
        """Retrieve recent logs."""
        return self._logs[:limit]

    def get_metric_summary(self) -> MetricSummary:
        """Calculate dashboard metrics from in-memory logs."""
        now = datetime.now()
        # Filter windows
        one_hour_ago = now.timestamp() - 3600
        one_day_ago = now.timestamp() - 86400
        
        # Counters
        total_auths = 0
        denied_count = 0
        threat_count = 0
        
        # For Timeline (last 10 events desc)
        timeline_data = []

        for log in self._logs:
            try:
                log_time = datetime.fromisoformat(log.timestamp).timestamp()
            except ValueError:
                continue
                
            if log_time > one_day_ago:
                if log.eventType in ["VERIFY_SUCCESS", "VERIFY_FAIL", "AUTH_SUCCESS", "AUTH_FAILURE"]:
                   if log_time > one_hour_ago:
                       total_auths += 1
                
                if log.eventType in ["VERIFY_FAIL", "ACCESS_DENIED", "AUTH_FAILURE"]:
                    denied_count += 1
                
                if log.severity == "CRITICAL" or "ATTACK" in log.eventType or "Threat" in log.details:
                    threat_count += 1
        
        # Timeline aggregation (group by minute or just raw last N events for simple charts)
        # Let's do a simple count per hour for the last 6 hours for the chart
        # OR just return the last 20 auth events for a scatter plot.
        # User asked for "Cards" primarily. Let's return raw timeline buckets.
        
        return MetricSummary(
            total_auths_1h=total_auths,
            access_denied_24h=denied_count,
            active_threats=0, # Placeholder or strictly active lockouts
            threats_detected_24h=threat_count,
            timeline=[] # Populate if needed for charts
        )

# Singleton instance
audit_logger = AuditService()
