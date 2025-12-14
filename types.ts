export interface BiometricTemplate {
  id: string;
  userId: string;
  algorithm: 'FaceID_v4' | 'Fingerprint_SHA256';
  dataHash: string; // HMAC-SHA256 of the embedding for Integrity Check
  salt: string; // Random salt per user to prevent Rainbow Table attacks
  encryptedData: string; // Simulated encrypted blob (AES-256-GCM)
  embedding: number[]; // Decrypted in memory ONLY during matching
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'SECURITY_ENGINEER';
  enrolled: boolean;
  biometricTemplate?: BiometricTemplate;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'ENROLLMENT' | 'ATTACK_DETECTED' | 'SYSTEM_ALERT' | 'CONFIG_CHANGE' | 'RATE_LIMIT_EXCEEDED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  sourceIp: string;
  userId?: string;
  username?: string;
  metadata?: Record<string, any>;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string; // Short-lived JWT
  refreshToken?: string; // Long-lived rotation token
  expiresIn?: number; // Seconds
  message: string;
  similarityScore?: number;
}

export interface BiometricMetrics {
  far: string; // False Acceptance Rate (%)
  frr: string; // False Rejection Rate (%)
  threshold: number; // Current Matching Threshold
  totalAttempts: number;
  falseAccepts: number;
  falseRejects: number;
}

export enum AttackType {
  REPLAY = 'REPLAY',
  TAMPERING = 'TAMPERING',
  BRUTE_FORCE = 'BRUTE_FORCE',
  THRESHOLD_MANIPULATION = 'THRESHOLD_MANIPULATION',
  UNAUTHORIZED_ENROLLMENT = 'UNAUTHORIZED_ENROLLMENT',
  SESSION_HIJACKING = 'SESSION_HIJACKING'
}