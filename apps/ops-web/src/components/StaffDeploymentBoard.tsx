import React, { useState } from 'react';
import styles from '../Dashboard.module.css';

interface Staff {
  id: string;
  name: string;
  role: string;
  location: string;
  status: 'active' | 'busy' | 'break';
}

interface Incident {
  id: string;
  type: string;
  zone: string;
  severity: 'low' | 'med' | 'high';
  assignedTo?: string;
}

const MOCK_STAFF: Staff[] = [
  { id: 's1', name: 'James Wilson', role: 'Security', location: 'Gate A', status: 'active' },
  { id: 's2', name: 'Sarah Chen', role: 'Usher', location: 'Section 102', status: 'busy' },
  { id: 's3', name: 'Mike Ross', role: 'Medic', location: 'First Aid B', status: 'active' },
];

const MOCK_INCIDENTS: Incident[] = [
  { id: 'i1', type: 'Crowd Crush', zone: 'North Stand', severity: 'high' },
  { id: 'i2', type: 'Spillage', zone: 'East Plaza', severity: 'low' },
];

export const StaffDeploymentBoard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);

  const handleAssign = (incidentId: string, staffId: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { ...inc, assignedTo: staffId } : inc
    ));
  };

  return (
    <div className={styles.splitView}>
      {/* Pane 1: Staff List */}
      <div className={styles.pane}>
        <h2 className={styles.paneTitle} tabIndex={0}>Active Personnel</h2>
        <div className={styles.list} role="list" aria-label="Active Personnel">
          {MOCK_STAFF.map(s => (
            <div key={s.id} className={styles.item} role="listitem" tabIndex={0} aria-label={`${s.name}, ${s.role} at ${s.location}, Status: ${s.status}`}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{s.role} • {s.location}</div>
              </div>
              <div style={{ 
                width: 10, height: 10, borderRadius: '50%', 
                backgroundColor: s.status === 'active' ? '#10b981' : '#f59e0b' 
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Pane 2: Incidents */}
      <div className={styles.pane}>
        <h2 className={styles.paneTitle} tabIndex={0}>Incident Queue</h2>
        <div className={styles.list} role="list" aria-label="Incident Queue">
          {incidents.map(inc => (
            <div key={inc.id} className={styles.item} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }} role="listitem" tabIndex={0} aria-label={`Incident: ${inc.type} at ${inc.zone}, severity ${inc.severity}`}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, color: inc.severity === 'high' ? '#ef4444' : '#fff' }}>
                  {inc.type}
                </div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5 }}>{inc.zone}</div>
              </div>
              
              {inc.assignedTo ? (
                <div style={{ fontSize: '0.85rem', color: '#10b981' }}>
                  Assigned to {MOCK_STAFF.find(ps => ps.id === inc.assignedTo)?.name}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleAssign(inc.id, 's1')}
                    style={{ background: '#333', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' }}
                    aria-label={`Assign security team to ${inc.type} at ${inc.zone}`}
                  >
                    Assign Security
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
