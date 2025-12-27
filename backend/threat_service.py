from typing import Dict, Optional
from audit_service import audit_logger
import time
import random

class ThreatService:
    def execute_simulation(self, attack_type: str, target_user: str, security_level: str, source_ip: str) -> Dict:
        """
        Executes a SAFE simulation of an attack vector.
        Returns the result dict.
        """
        
        # 1. Log the initiation (Forensic Audit)
        audit_logger.log(
            event_type=f"SIMULATION_START:{attack_type}",
            severity="INFO",
            details=f"Adversary Emulation Started against {target_user}. Profile: {security_level}",
            username="admin_simulator",
            source_ip=source_ip
        )
        
        # 2. Simulate Attack Logic
        # Note: In a real red-team tool, this would fire actual exploits. 
        # Here we simulate the *backend's response* to those exploits safely.
        
        success = False
        message = "Attack Blocked"
        
        if attack_type == "REPLAY":
            if security_level == "HIGH":
                time.sleep(0.5)
                success = False
                message = "Replay Blocked: Nonce validation rejected reuse of old packet."
                audit_logger.log(
                    event_type="ATTACK_DETECTED",
                    severity="CRITICAL",
                    details=f"REPLAY ATTACK BLOCKED: Stale Nonce from {source_ip}",
                    username=target_user,
                    source_ip=source_ip
                )
            else:
                success = True
                message = "Replay Successful: System processed stale packet (Low Security)."
        
        elif attack_type == "SESSION_HIJACKING":
             if security_level == "HIGH":
                 time.sleep(0.4)
                 success = False
                 message = "Hijack Blocked: IP Mismatch detected (Geo-binding active)."
                 audit_logger.log(
                    event_type="ATTACK_DETECTED",
                    severity="CRITICAL",
                    details=f"SESSION HIJACK BLOCKED: Token used from unexpected IP",
                    username=target_user,
                    source_ip=source_ip
                )
             else:
                 success = True
                 message = "Session Hijacked: Token accepted from new IP."
                 
        elif attack_type == "BRUTE_FORCE":
             # Simulate 100 rapid attempts
             blocked_at = 5 if security_level == "HIGH" else 50
             
             audit_logger.log(
                event_type="TRAFFIC_ANOMALY",
                severity="WARNING",
                details=f"High velocity auth requests detected (>100 req/s)",
                username=target_user,
                source_ip=source_ip
             )
             
             if security_level == "HIGH":
                 success = False
                 message = "Brute Force Throttled: Zero Trust Rate Limit engaged."
             else:
                 success = True
                 message = "Brute Force: 12 weak passwords attempted successfully."

        elif attack_type == "INJECTION":
             if security_level == "HIGH":
                 success = False
                 message = "Injection Blocked: Input sanitization stripped SQL vectors."
                 audit_logger.log(
                    event_type="ATTACK_DETECTED",
                    severity="CRITICAL",
                    details=f"SQL INJECTION ATTEMPT: payload=' OR 1=1;--",
                    username=target_user,
                    source_ip=source_ip
                 )
             else:
                 success = True
                 message = "Injection Success: Database returned unrestricted records."
                 
        else:
             message = f"Simulation for {attack_type} not implemented."

        # 3. Log Outcome
        audit_logger.log(
            event_type=f"SIMULATION_RESULT:{attack_type}",
            severity="INFO" if not success else "WARNING",
            details=f"Result: {message}",
            username=target_user,
            source_ip=source_ip
        )

        return {
            "success": success,
            "message": message,
            "attackType": attack_type
        }

threat_service = ThreatService()
