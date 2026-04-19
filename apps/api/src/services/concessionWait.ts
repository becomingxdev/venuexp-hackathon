/**
 * Concession wait-time service.
 *
 * Same broadcast pattern as gateWait — Firestore listener in prod,
 * simulated tick in dev. Covers food, beverage, merchandise & restrooms.
 */
import { Server } from 'socket.io';
import winston from 'winston';
import type { Concession, WaitTimeEvent } from '@venuexp/shared';
import { WS_EVENTS, CONSTANTS } from '@venuexp/shared';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// ── Simulated seed data ──────────────────────────────────────────────
const SEED_CONCESSIONS: Concession[] = [
  { id: 'food-1',   name: 'Burger Bar — Concourse A',    category: 'food',      currentWaitMinutes: 14, capacityPercent: 72, isOpen: true, lastUpdated: new Date().toISOString(), location: { lat: 19.0762, lng: 72.8775 }, floor: 1, isAccessible: true,  tags: ['burgers'] },
  { id: 'food-2',   name: 'Noodle Stand — Concourse B',  category: 'food',      currentWaitMinutes: 7,  capacityPercent: 40, isOpen: true, lastUpdated: new Date().toISOString(), location: { lat: 19.0765, lng: 72.8780 }, floor: 1, isAccessible: true,  tags: ['vegetarian', 'gluten-free'] },
  { id: 'bev-1',    name: 'Craft Beer Tap — South',      category: 'beverage',  currentWaitMinutes: 18, capacityPercent: 88, isOpen: true, lastUpdated: new Date().toISOString(), location: { lat: 19.0755, lng: 72.8765 }, floor: 0, isAccessible: false, tags: ['beer', 'craft'] },
  { id: 'bev-2',    name: 'Juice & Smoothie — North',    category: 'beverage',  currentWaitMinutes: 4,  capacityPercent: 25, isOpen: true, lastUpdated: new Date().toISOString(), location: { lat: 19.0770, lng: 72.8785 }, floor: 2, isAccessible: true,  tags: ['non-alcoholic'] },
  { id: 'rest-1',   name: 'Restroom — Concourse A (L0)', category: 'restroom',  currentWaitMinutes: 5,  capacityPercent: 55, isOpen: true, lastUpdated: new Date().toISOString(), location: { lat: 19.0763, lng: 72.8772 }, floor: 0, isAccessible: true,  tags: ['family'] },
  { id: 'rest-2',   name: 'Restroom — South Stand (L1)', category: 'restroom',  currentWaitMinutes: 9,  capacityPercent: 70, isOpen: true, lastUpdated: new Date().toISOString(), location: { lat: 19.0758, lng: 72.8768 }, floor: 1, isAccessible: false, tags: [] },
  { id: 'merch-1',  name: 'Team Store — Main',           category: 'merchandise', currentWaitMinutes: 3, capacityPercent: 15, isOpen: true, lastUpdated: new Date().toISOString(), location: { lat: 19.0768, lng: 72.8790 }, floor: 0, isAccessible: true,  tags: ['jerseys'] },
];

function jitter(base: number, range: number): number {
  return Math.max(0, Math.round(base + (Math.random() * range * 2 - range)));
}

export function initConcessionWaitService(io: Server): { getConcessions: () => Concession[] } {
  let concessions: Concession[] = [...SEED_CONCESSIONS];

  const interval = setInterval(() => {
    concessions = concessions.map((c) => ({
      ...c,
      currentWaitMinutes: jitter(c.currentWaitMinutes, 3),
      capacityPercent: Math.min(100, jitter(c.capacityPercent, 6)),
      lastUpdated: new Date().toISOString(),
    }));

    const events: WaitTimeEvent[] = concessions.map((c) => ({
      type: c.category === 'restroom' ? 'restroom' : 'concession',
      facilityId: c.id,
      waitMinutes: c.currentWaitMinutes,
      capacityPercent: c.capacityPercent,
      timestamp: c.lastUpdated,
    }));

    io.emit(WS_EVENTS.CONCESSION_UPDATE, concessions);
    events.forEach((e) => io.emit(WS_EVENTS.WAIT_TIME_UPDATE, e));

    logger.info('Concession wait-time broadcast', { count: concessions.length });
  }, CONSTANTS.WAIT_REFRESH_INTERVAL_MS);

  io.on('close', () => clearInterval(interval));

  return { getConcessions: () => concessions };
}
