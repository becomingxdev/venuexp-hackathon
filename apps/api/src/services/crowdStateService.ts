import { Server, Socket } from 'socket.io';
import * as admin from 'firebase-admin';
import winston from 'winston';
import throttle from 'lodash/throttle';
import { CrowdState, WS_EVENTS } from '@venuexp/shared';
import { vertexPredictor } from './vertexPredictor';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

/**
 * Crowd State Service.
 * Listens to Firestore `/crowd_states` and manages Socket.io zone rooms.
 */
export function initCrowdStateService(io: Server) {
  const db = admin.firestore();
  
  // Throttle broadcasting per zone to avoid overwhelming clients
  const zoneThrottlers = new Map<string, (state: CrowdState) => void>();

  const getZoneThrottler = (zoneId: string) => {
    if (!zoneThrottlers.has(zoneId)) {
      zoneThrottlers.set(zoneId, throttle(async (state: CrowdState) => {
        try {
          const prediction = await vertexPredictor.predictWaitTime(state.density, state.trend);
          const enhancedState: CrowdState = {
            ...state,
            predictedWait: prediction.predictedWaitMinutes
          };

          io.to(`zone:${state.zoneId}`).emit(WS_EVENTS.CROWD_ZONE_UPDATE, enhancedState);
          
          logger.info('Broadcasted zone update', { 
            zoneId: state.zoneId, 
            model: prediction.model 
          });
        } catch (err) {
          logger.error('Error broadcasting update', err);
        }
      }, 5000)); // 5 seconds throttle per zone
    }
    return zoneThrottlers.get(zoneId)!;
  };

  // Real-time subscription to Firestore
  const unsubscribe = db.collection('crowd_states').onSnapshot(async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === 'added' || change.type === 'modified') {
        const state = change.doc.data() as CrowdState;
        const throttler = getZoneThrottler(state.zoneId);
        throttler(state);
      }
    }
  }, (err) => {
    logger.error('Firestore subscription failed', err);
  });

  /**
   * Room management logic.
   * Clients join rooms for specific zones to receive targeted updates.
   */
  const handleConnection = (socket: Socket) => {
    socket.on('joinZone', (zoneId: string) => {
      const room = `zone:${zoneId}`;
      socket.join(room);
      logger.info(`Client ${socket.id} joined ${room}`);
      
      // Send current snapshot of that zone if available
      db.collection('crowd_states').doc(zoneId).get().then(doc => {
        if (doc.exists) {
          socket.emit(WS_EVENTS.CROWD_ZONE_UPDATE, doc.data());
        }
        socket.emit(WS_EVENTS.ZONE_READY, { zoneId });
      });
    });

    socket.on('leaveZone', (zoneId: string) => {
      const room = `zone:${zoneId}`;
      socket.leave(room);
      logger.info(`Client ${socket.id} left ${room}`);
    });
  };

  return { unsubscribe, handleConnection };
}
