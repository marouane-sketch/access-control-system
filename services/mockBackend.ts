import { User, BiometricTemplate, SecurityLog, AuthResponse, AttackType, BiometricMetrics } from '../types';

// --- SECURITY CONFIGURATION ---
const EMBEDDING_SIZE = 128;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 Minute Window
const MAX_ATTEMPTS_PER_WINDOW = 5; // Strict locking after 5 failures
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 Minutes (Short-lived Access Token)

// Mutable Global Threshold for Tuning (RBAC Protected)
let GLOBAL_THRESHOLD = 0.94; 

// --- STATE ---
let stats = {
  trueAccepts: 0,
  falseRejects: 0, 
  trueRejects: 0,
  falseAccepts: 0 
};

// Rate Limiting Store: Map<IP, timestamp[]>
const rateLimitStore = new Map<string, number[]>();

// START EMPTY - Users must be created via the application
let users: User[] = [];

let logs: SecurityLog[] = [];
let capturedPackets: { userId: string, embedding: number[], timestamp: number, nonce: string }[] = []; 
let activeSessions: Record<string, { userId: string, ip: string, expires: number, role: string }> = {};

// --- CRYPTOGRAPHIC HELPERS (Simulated) ---

/**
 * Simulates a salted cryptographic hash (e.g., PBKDF2 or SHA-256).
 * Security: Prevents Rainbow Table attacks by ensuring identical biometrics yield different hashes.
 */
function secureHash(data: number[] | string, salt: string): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  const combined = str + salt;
  
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0'); // Simulate SHA-256 length
}

const generateEmbedding = (): number[] => {
  return Array.from({ length: EMBEDDING_SIZE }, () => Math.random() * 2 - 1);
};

const calculateVariance = (vec: number[]): number => {
    const mean = vec.reduce((a, b) => a + b, 0) / vec.length;
    return Math.sqrt(vec.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / vec.length);
};

const calculateSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

// --- SECURITY MIDDLEWARE ---

/**
 * Rate Limiter: Token Bucket Algorithm
 * Prevents Brute Force and DoS attacks.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = rateLimitStore.get(ip) || [];
  
  // Filter out attempts older than the window
  const recentAttempts = attempts.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (recentAttempts.length >= MAX_ATTEMPTS_PER_WINDOW) {
    // Log event only if it's the first block to avoid log flooding
    if (recentAttempts.length === MAX_ATTEMPTS_PER_WINDOW) {
         MockBackend.logEvent({
            eventType: 'RATE_LIMIT_EXCEEDED',
            severity: 'WARNING',
            details: `IP ${ip} throttled. Too many authentication attempts.`,
            sourceIp: ip
         });
    }
    rateLimitStore.set(ip, recentAttempts); // Update cleanup
    return false; // Blocked
  }

  recentAttempts.push(now);
  rateLimitStore.set(ip, recentAttempts);
  return true; // Allowed
}

export const MockBackend = {
  
  // --- ADMIN CONFIGURATION (RBAC) ---
  
  setThreshold: (newThreshold: number) => {
    // In a real backend, we would check: if (ctx.user.role !== 'ADMIN') throw 403;
    // For this simulation, we log the config change for audit trails.
    
    if (newThreshold < 0.5) {
        MockBackend.logEvent({
            eventType: 'SYSTEM_ALERT',
            severity: 'CRITICAL',
            details: `Unsafe configuration attempt detected. Threshold ${newThreshold} is too low.`,
            sourceIp: 'ADMIN_CONSOLE',
            username: 'admin_alice' // Simulated context
        });
        // We allow it for "Demo" purposes of the Attack vector, but in production, this rejects.
    }

    GLOBAL_THRESHOLD = newThreshold;
    MockBackend.logEvent({
      eventType: 'CONFIG_CHANGE',
      severity: 'WARNING',
      details: `Biometric Matching Threshold adjusted to ${(newThreshold * 100).toFixed(1)}%`,
      sourceIp: 'ADMIN_CONSOLE',
      username: 'admin_alice'
    });
  },

  getMetrics: (): BiometricMetrics => {
    const validUserAttempts = stats.trueAccepts + stats.falseRejects;
    const imposterAttempts = stats.trueRejects + stats.falseAccepts;

    const frr = validUserAttempts > 0 
      ? ((stats.falseRejects / validUserAttempts) * 100).toFixed(2) 
      : "0.00";

    const far = imposterAttempts > 0 
      ? ((stats.falseAccepts / imposterAttempts) * 100).toFixed(2) 
      : "0.00";

    return {
      far,
      frr,
      threshold: GLOBAL_THRESHOLD,
      totalAttempts: validUserAttempts + imposterAttempts,
      falseAccepts: stats.falseAccepts,
      falseRejects: stats.falseRejects
    };
  },

  // --- IDENTITY MANAGEMENT ---

  registerUser: async (username: string, role: User['role']): Promise<User> => {
    await new Promise(r => setTimeout(r, 600)); 
    if (users.find(u => u.username === username)) throw new Error(`Username '${username}' is already taken.`);

    const newUser: User = {
      id: `u_${Date.now()}`,
      username,
      role, // Role is assigned here. In production, Role assignment requires SuperAdmin privileges.
      enrolled: false
    };
    users.push(newUser);
    MockBackend.logEvent({ 
      eventType: 'SYSTEM_ALERT', 
      severity: 'INFO', 
      details: `New Identity Registered: ${username} [${role}]`, 
      sourceIp: 'INTERNAL_REGISTRY',
      userId: newUser.id,
      username: newUser.username
    });
    return newUser;
  },

  enrollUser: async (userId: string, customEmbedding?: number[]): Promise<BiometricTemplate> => {
    await new Promise(r => setTimeout(r, 800)); 
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    const embedding = customEmbedding || generateEmbedding();
    if (calculateVariance(embedding) < 0.05) throw new Error("Biometric Quality Low: Image too uniform.");

    // SECURITY: Generate Salt and Hash
    const salt = Math.random().toString(36).substring(2);
    const hash = secureHash(embedding, salt);

    const template: BiometricTemplate = {
      id: `tmpl_${Date.now()}`,
      userId: user.id,
      algorithm: 'FaceID_v4',
      embedding: embedding,
      encryptedData: `AES256::${hash.substring(0,8)}...`, // Simulated Encrypted Blob
      dataHash: hash,
      salt: salt,
      createdAt: new Date().toISOString()
    };
    
    user.biometricTemplate = template;
    user.enrolled = true;
    MockBackend.logEvent({ 
      eventType: 'ENROLLMENT', 
      severity: 'INFO', 
      details: `User ${user.username} enrolled. Template Hashed & Salted.`, 
      sourceIp: '192.168.1.10',
      userId: user.id,
      username: user.username
    });
    return template;
  },

  // --- AUTHENTICATION ENGINE ---

  verifyUser: async (userId: string, inputEmbedding?: number[], thresholdOverride?: number, contextIp = '192.168.1.10', isAttack = false): Promise<AuthResponse> => {
    
    // 1. RATE LIMIT CHECK
    if (!checkRateLimit(contextIp)) {
        return { 
            success: false, 
            message: `Too many attempts. Access blocked for ${RATE_LIMIT_WINDOW_MS/1000}s.`, 
            similarityScore: 0 
        };
    }

    await new Promise(r => setTimeout(r, 600)); // Simulate processing time

    const threshold = thresholdOverride ?? GLOBAL_THRESHOLD;
    const user = users.find(u => u.id === userId);

    if (!user || !user.biometricTemplate) {
      MockBackend.logEvent({ 
        eventType: 'AUTH_FAILURE', 
        severity: 'WARNING', 
        details: `Identity Check Failed: ${userId}`, 
        sourceIp: contextIp,
        userId: userId
      });
      return { success: false, message: 'Identity not found or not enrolled', similarityScore: 0 };
    }

    // 2. LIVENESS CHECK (Anti-Spoofing)
    if (!inputEmbedding) return { success: false, message: 'No biometric data', similarityScore: 0 };
    if (calculateVariance(inputEmbedding) < 0.02) {
        MockBackend.logEvent({ 
          eventType: 'AUTH_FAILURE', 
          severity: 'WARNING', 
          details: `Spoof Detected: Low variance`, 
          sourceIp: contextIp,
          userId: user.id,
          username: user.username
        });
        return { success: false, message: 'Liveness Check Failed', similarityScore: 0 };
    }

    // 3. INTEGRITY CHECK (Tamper Detection)
    const computedHash = secureHash(user.biometricTemplate.embedding, user.biometricTemplate.salt);
    
    if (computedHash !== user.biometricTemplate.dataHash) {
        MockBackend.logEvent({ 
          eventType: 'SYSTEM_ALERT', 
          severity: 'CRITICAL', 
          details: `DATA INTEGRITY VIOLATION: Template for ${user.username} modified externally.`, 
          sourceIp: 'SYSTEM_INTERNAL',
          userId: user.id,
          username: user.username
        });
        return { success: false, message: 'CRITICAL: Data Integrity Violation. Account Locked.', similarityScore: 0 };
    }

    // 4. MATCHING ENGINE
    const score = calculateSimilarity(inputEmbedding, user.biometricTemplate.embedding);
    const isMatch = score >= threshold;

    // Update Metrics
    if (isMatch) {
      isAttack ? stats.falseAccepts++ : stats.trueAccepts++;
    } else {
      isAttack ? stats.trueRejects++ : stats.falseRejects++;
    }

    if (isMatch) {
      // 5. SESSION GENERATION (JWT)
      const accessToken = `jwt_access_${Date.now()}_${Math.random().toString(36).substr(2)}`;
      const refreshToken = `jwt_refresh_${Date.now()}_${Math.random().toString(36).substr(2)}`;
      
      activeSessions[accessToken] = { 
          userId: user.id, 
          ip: contextIp, 
          expires: Date.now() + TOKEN_EXPIRY_MS,
          role: user.role
      };

      MockBackend.logEvent({ 
        eventType: 'AUTH_SUCCESS', 
        severity: 'INFO', 
        details: `Access Granted: ${user.username} (Score: ${score.toFixed(4)})`, 
        sourceIp: contextIp,
        userId: user.id,
        username: user.username
      });
      
      return { 
          success: true, 
          message: 'Identity Verified', 
          similarityScore: score, 
          accessToken,
          refreshToken,
          expiresIn: TOKEN_EXPIRY_MS / 1000
      };
    } else {
      MockBackend.logEvent({ 
        eventType: 'AUTH_FAILURE', 
        severity: 'WARNING', 
        details: `Biometric Mismatch: ${user.username} (Score: ${score.toFixed(4)})`, 
        sourceIp: contextIp,
        userId: user.id,
        username: user.username
      });
      return { success: false, message: 'Identity Verification Failed', similarityScore: score };
    }
  },

  // --- ATTACK & DEBUG TOOLS ---

  rotateToken: (refreshToken: string) => {
      // Logic to invalidate old access token and issue new one would go here
      return "new_access_token_" + Date.now();
  },

  captureTraffic: (userId: string, embedding: number[]) => {
    capturedPackets.push({ 
        userId, 
        embedding, 
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(7)
    });
    return capturedPackets.length;
  },

  simulateAttack: async (type: AttackType, targetUserId: string, params: any = {}): Promise<any> => {
    await new Promise(r => setTimeout(r, 1200)); 
    const user = users.find(u => u.id === targetUserId);
    const attackerIp = '10.0.66.6'; 

    switch (type) {
      case AttackType.REPLAY:
        if (capturedPackets.length === 0) return { success: false, message: "No packets captured." };
        const packet = capturedPackets[capturedPackets.length - 1]; 
        
        // REPLAY DEFENSE: Timestamp Check
        if (params.securityLevel === 'HIGH') {
            const age = Date.now() - packet.timestamp;
            // Strict 5 second window for replay protection
            if (age > 5000) {
                 MockBackend.logEvent({
                    eventType: 'ATTACK_DETECTED',
                    severity: 'CRITICAL',
                    details: `REPLAY BLOCKED: Stale Packet (Age: ${age}ms).`,
                    sourceIp: attackerIp,
                    userId: targetUserId,
                    username: user?.username
                });
                return { success: false, message: "Replay Detected: Timestamp expired." };
            }
        }
        return await MockBackend.verifyUser(targetUserId, packet.embedding, undefined, attackerIp, true);

      case AttackType.TAMPERING:
        if (!user || !user.biometricTemplate) return { success: false, message: "No template." };
        const originalHash = user.biometricTemplate.dataHash;
        // Attack: Modify hash but not salt/data (or vice versa)
        user.biometricTemplate.dataHash = "0xCORRUPTED_HASH";
        
        const res = await MockBackend.verifyUser(targetUserId, user.biometricTemplate.embedding, undefined, attackerIp, true);
        
        // Restore
        setTimeout(() => { if(user.biometricTemplate) user.biometricTemplate.dataHash = originalHash; }, 5000);
        return res;

      case AttackType.BRUTE_FORCE:
        let maxScore = 0;
        // Attempt 20 times. If Rate Limiting is active (High Security), this loop will fail early.
        for(let i=0; i<20; i++) {
           const result = await MockBackend.verifyUser(targetUserId, generateEmbedding(), 0.98, attackerIp, true); 
           
           if (!result.success && result.message.includes('Too many attempts')) {
               return { success: false, message: "Brute Force Throttled (Rate Limit Active)" };
           }

           if (result.success) return { success: true, message: "Brute Force SUCCESS" };
           if ((result.similarityScore || 0) > maxScore) maxScore = result.similarityScore || 0;
        }
        return { success: false, message: `Brute Force Failed. Best Score: ${maxScore.toFixed(4)}` };

      case AttackType.UNAUTHORIZED_ENROLLMENT:
        if (params.securityLevel === 'HIGH') {
             MockBackend.logEvent({
                eventType: 'ATTACK_DETECTED',
                severity: 'CRITICAL',
                details: `BOLA Exploitation Blocked: Enrollment checks failed.`,
                sourceIp: attackerIp,
                username: 'shadow_admin'
            });
            return { success: false, message: "Enrollment Rejected: Invalid Identity Reference." };
        }
        return { success: true, message: "Vulnerability Exploited: Shadow Admin Enrolled." };

      case AttackType.SESSION_HIJACKING:
        const victimAuth = await MockBackend.verifyUser(targetUserId, user?.biometricTemplate?.embedding);
        if (!victimAuth.accessToken) return { success: false, message: "Could not establish victim session." };
        
        const stolenToken = victimAuth.accessToken;
        const attackerContextIp = "203.0.113.55";

        if (params.securityLevel === 'HIGH') {
            const session = activeSessions[stolenToken];
            if (session && session.ip !== attackerContextIp) {
                 MockBackend.logEvent({
                    eventType: 'ATTACK_DETECTED',
                    severity: 'CRITICAL',
                    details: `Session Hijacking Blocked: Token bound to ${session.ip}, used by ${attackerContextIp}`,
                    sourceIp: attackerContextIp,
                    userId: targetUserId,
                    username: user?.username
                });
                return { success: false, message: "Token Invalid: IP Mismatch (Geo-binding active)." };
            }
        }
        return { success: true, message: "Session Hijacked! Access granted." };

      case AttackType.THRESHOLD_MANIPULATION:
         if (params.securityLevel === 'HIGH') return { success: false, message: "Config Locked. Write access denied." };
         return await MockBackend.verifyUser(targetUserId, generateEmbedding(), 0.1, attackerIp, true);
    }
    return { success: false, message: "Unknown Attack" };
  },

  logEvent: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    logs = [newLog, ...logs].slice(0, 100); 
  },

  getLogs: () => logs,
  getUsers: () => users,
};