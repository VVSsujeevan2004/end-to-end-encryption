export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  AUDITOR: 'AUDITOR'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  username: string;
  role: UserRole;
  publicKey?: CryptoKey;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string; // This is the CLEARTEXT for the sender/receiver
  encryptedContent: string; // Base64 of the ciphertext
  timestamp: number;
  integrityHash: string; // Mock hash for forensic chain
  isSystem?: boolean;
}

export const LogEventType = {
  LOGIN: 'LOGIN',
  KEY_EXCHANGE: 'KEY_EXCHANGE',
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_DECRYPTED: 'MESSAGE_DECRYPTED',
  SUSPICIOUS_KEYWORD: 'SUSPICIOUS_KEYWORD',
  LOGOUT: 'LOGOUT',
  ANOMALY_DETECTED: 'ANOMALY_DETECTED'
} as const;

export type LogEventType = typeof LogEventType[keyof typeof LogEventType];

export interface ForensicLog {
  id: string;
  timestamp: number;
  userId: string;
  eventType: LogEventType;
  metadata: Record<string, any>;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  hash: string; // Tamper-evident hash
}

export interface RiskFactor {
  factor: string;
  points: number;
  count: number;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  anomalies: string[];
  riskFactors: RiskFactor[];
}