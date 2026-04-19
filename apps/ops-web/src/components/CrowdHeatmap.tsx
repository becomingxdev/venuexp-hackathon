import React, { useEffect, useState } from 'react';
import styles from '../Dashboard.module.css';
import { CrowdState, WS_EVENTS } from '@venuexp/shared';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const ZONES = [
  { id: 'zone-north', name: 'North Stand Concourse' },
  { id: 'zone-south', name: 'South Stand Concourse' },
  { id: 'zone-east', name: 'East Plaza' },
  { id: 'zone-west', name: 'West Gate Entrance' },
];

export const CrowdHeatmap: React.FC = () => {
  const [data, setData] = useState<Record<string, CrowdState>>({});

  useEffect(() => {
    // Join all zone rooms
    ZONES.forEach(z => {
      socket.emit('joinZone', z.id);
    });

    socket.on(WS_EVENTS.CROWD_ZONE_UPDATE, (state: CrowdState) => {
      setData(prev => ({ ...prev, [state.zoneId]: state }));
    });

    return () => {
      ZONES.forEach(z => socket.emit('leaveZone', z.id));
      socket.off(WS_EVENTS.CROWD_ZONE_UPDATE);
    };
  }, []);

  const getSeverityClass = (density: number) => {
    if (density > 4) return styles.severityHigh;
    if (density > 2) return styles.severityModerate;
    return styles.severityLow;
  };

  return (
    <div className={styles.heatmapContainer}>
      <h2 className={styles.paneTitle} tabIndex={0}>Live Crowd Density Heatmap</h2>
      
      <div className={styles.zoneGrid} role="list" aria-label="Zone Densities">
        {ZONES.map(z => {
          const state = data[z.id];
          return (
            <div 
              key={z.id} 
              className={`${styles.zoneCard} ${state ? getSeverityClass(state.density) : ''}`}
              role="listitem"
              tabIndex={0}
              aria-label={`${z.name}, density ${state ? state.density.toFixed(1) : 'unknown'} people per square meter, wait time ${state ? state.predictedWait : 'unknown'} minutes`}
            >
              <h3>{z.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0' }}>
                {state ? state.density.toFixed(1) : '--'}
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}> ppl/m²</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Wait: {state ? state.predictedWait : '--'}m</span>
                <span style={{ color: state?.trend === 1 ? '#ef4444' : (state?.trend === -1 ? '#10b981' : '#f59e0b') }}>
                  {state?.trend === 1 ? '↑' : (state?.trend === -1 ? '↓' : '→')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', opacity: 0.4, fontSize: '0.8rem' }}>
        * Updates are reactive via Socket.io zone-specific rooms.
      </div>
    </div>
  );
};
