// ── Auth ──────────────────────────────────────────────────────────────
export type UserRole = 'fan' | 'ops-staff' | 'admin';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  isAnonymous: boolean;
}

// ── Gates ─────────────────────────────────────────────────────────────
export type GateStatus = 'open' | 'closed' | 'at-capacity';

export interface Gate {
  id: string;
  name: string;
  status: GateStatus;
  currentWaitMinutes: number;
  /** 0–100 capacity percentage */
  capacityPercent: number;
  /** ISO-8601 */
  lastUpdated: string;
  location: LatLng;
  isAccessible: boolean;
}

// ── Wait-time events (WebSocket payloads) ─────────────────────────────
export interface WaitTimeEvent {
  type: 'gate' | 'concession' | 'restroom';
  facilityId: string;
  waitMinutes: number;
  capacityPercent: number;
  timestamp: string;
}

// ── Concessions ───────────────────────────────────────────────────────
export type ConcessionCategory = 'food' | 'beverage' | 'merchandise' | 'restroom';

export interface Concession {
  id: string;
  name: string;
  category: ConcessionCategory;
  currentWaitMinutes: number;
  capacityPercent: number;
  isOpen: boolean;
  lastUpdated: string;
  location: LatLng;
  floor: number;
  isAccessible: boolean;
  tags: string[];           // e.g. ["gluten-free", "vegetarian"]
}

// ── Crowd zones ───────────────────────────────────────────────────────
export type ZoneSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface CrowdZone {
  id: string;
  name: string;
  currentDensity: number;   // people per sq-m
  capacityPercent: number;
  severity: ZoneSeverity;
  lastUpdated: string;
  polygon: LatLng[];        // boundary vertices
}

// ── IoT Pipeline ──────────────────────────────────────────────────────
export type IoTSensorType = 'turnstile' | 'ir_counter' | 'wifi_probe';

export interface IoTEvent {
  deviceId: string;
  sensorType: IoTSensorType;
  count: number;
  zoneId: string;
  timestamp: number;
}

export interface CrowdState {
  zoneId: string;
  density: number;
  lastUpdated: string;      // ISO-8601
  trend: number;            // -1 (decreasing), 0 (stable), 1 (increasing)
  predictedWait: number;    // minutes
}

// ── Geo helpers ───────────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

// ── Accessibility ─────────────────────────────────────────────────────
export interface AccessibilityProfile {
  accessibleRouting: boolean;
  avoidStairs: boolean;
  largeText: boolean;
  reduceMotion: boolean;
}

// ── Socket event names (single source of truth) ──────────────────────
export const WS_EVENTS = {
  WAIT_TIME_UPDATE: 'waitTimeUpdate',
  GATE_UPDATE: 'gateUpdate',
  CONCESSION_UPDATE: 'concessionUpdate',
  CROWD_ZONE_UPDATE: 'crowdZoneUpdate',
  ZONE_READY: 'zoneReady',   // emitted when a user joins a zone room
} as const;

// ── Constants ─────────────────────────────────────────────────────────
export const CONSTANTS = {
  API_URL: 'http://localhost:3000',
  WS_URL: 'ws://localhost:3000',
  WAIT_REFRESH_INTERVAL_MS: 30_000,
  CAPACITY_ALERT_THRESHOLD: 85,
} as const;
