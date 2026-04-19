/**
 * useRealTimeWait — React hook wrapping Socket.IO client.
 *
 * Connects once, receives gate + concession updates, and exposes
 * the latest state to UI components. Auto-reconnects on disconnect.
 */
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Gate, Concession } from '@venuexp/shared';
import { CONSTANTS, WS_EVENTS } from '@venuexp/shared';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(CONSTANTS.WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }
  return socket;
}

export function useRealTimeWait() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    s.on(WS_EVENTS.GATE_UPDATE, (data: Gate[]) => {
      setGates(data);
    });

    s.on(WS_EVENTS.CONCESSION_UPDATE, (data: Concession[]) => {
      setConcessions(data);
    });

    return () => {
      s.off(WS_EVENTS.GATE_UPDATE);
      s.off(WS_EVENTS.CONCESSION_UPDATE);
      s.off('connect');
      s.off('disconnect');
    };
  }, []);

  return { gates, concessions, connected };
}
