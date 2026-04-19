/**
 * Gate wait-time service.
 *
 * Listens to the Firestore `gates` collection for real-time changes
 * and fans-out updates through Socket.IO to all connected clients.
 *
 * In development mode, generates simulated data so the frontend
 * can be built without a live Firestore backend.
 */
import { Server } from 'socket.io';
import winston from 'winston';
import type { Gate, WaitTimeEvent } from '@venuexp/shared';
import { WS_EVENTS, CONSTANTS } from '@venuexp/shared';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// ── Simulated seed data ──────────────────────────────────────────────
const SEED_GATES: Gate[] = [
  { id: 'gate-a', name: 'Gate A — Main Entrance',  status: 'open', currentWaitMinutes: 12, capacityPercent: 68, lastUpdated: new Date().toISOString(), location: { lat: 19.076, lng: 72.877 }, isAccessible: true  },
  { id: 'gate-b', name: 'Gate B — North Stand',    status: 'open', currentWaitMinutes: 8,  capacityPercent: 45, lastUpdated: new Date().toISOString(), location: { lat: 19.077, lng: 72.878 }, isAccessible: false },
  { id: 'gate-c', name: 'Gate C — South Stand',    status: 'open', currentWaitMinutes: 22, capacityPercent: 89, lastUpdated: new Date().toISOString(), location: { lat: 19.075, lng: 72.876 }, isAccessible: true  },
  { id: 'gate-d', name: 'Gate D — VIP / Accessible', status: 'open', currentWaitMinutes: 3, capacityPercent: 20, lastUpdated: new Date().toISOString(), location: { lat: 19.078, lng: 72.879 }, isAccessible: true },
];

function jitter(base: number, range: number): number {
  return Math.max(0, Math.round(base + (Math.random() * range * 2 - range)));
}

/**
 * Bootstrap gate-wait broadcasting.
 * Returns the current snapshot so routes can serve it via REST too.
 */
export function initGateWaitService(io: Server): { getGates: () => Gate[] } {
  let gates: Gate[] = [...SEED_GATES];

  // In dev mode, simulate changes every WAIT_REFRESH_INTERVAL_MS
  const interval = setInterval(() => {
    gates = gates.map((g) => ({
      ...g,
      currentWaitMinutes: jitter(g.currentWaitMinutes, 4),
      capacityPercent: Math.min(100, jitter(g.capacityPercent, 8)),
      lastUpdated: new Date().toISOString(),
      status: g.capacityPercent >= CONSTANTS.CAPACITY_ALERT_THRESHOLD ? 'at-capacity' : 'open',
    }));

    const events: WaitTimeEvent[] = gates.map((g) => ({
      type: 'gate',
      facilityId: g.id,
      waitMinutes: g.currentWaitMinutes,
      capacityPercent: g.capacityPercent,
      timestamp: g.lastUpdated,
    }));

    io.emit(WS_EVENTS.GATE_UPDATE, gates);
    events.forEach((e) => io.emit(WS_EVENTS.WAIT_TIME_UPDATE, e));

    logger.info('Gate wait-time broadcast', { count: gates.length });
  }, CONSTANTS.WAIT_REFRESH_INTERVAL_MS);

  // Clean-up helper (for graceful shutdown / tests)
  io.on('close', () => clearInterval(interval));

  return { getGates: () => gates };
}
