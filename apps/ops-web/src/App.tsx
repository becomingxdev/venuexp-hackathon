import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { CrowdHeatmap } from './components/CrowdHeatmap';
import { StaffDeploymentBoard } from './components/StaffDeploymentBoard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'staff'>('heatmap');

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div style={{ flex: 1 }}>
          <div className={styles.title} style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>VenueXP</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Smart Sporting Venue Experience Platform</div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
             <span style={{ background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>📡 Real-time crowd intelligence</span>
             <span style={{ background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>⏱️ Wait time reduction</span>
             <span style={{ background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>☁️ Google Cloud + Firebase powered</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', alignSelf: 'flex-start' }}>
          <div style={{ background: '#ef4444', height: 8, width: 8, borderRadius: '50%' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>LIVE</span>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.tabs} role="tablist">
          <button 
            className={`${styles.tab} ${activeTab === 'heatmap' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('heatmap')}
            role="tab"
            aria-selected={activeTab === 'heatmap'}
            aria-controls="heatmap-panel"
            id="heatmap-tab"
            tabIndex={0}
          >
            Crowd Heatmap
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'staff' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('staff')}
            role="tab"
            aria-selected={activeTab === 'staff'}
            aria-controls="staff-panel"
            id="staff-tab"
            tabIndex={0}
          >
            Staff Deployment
          </button>
        </div>

        {activeTab === 'heatmap' ? <CrowdHeatmap /> : <StaffDeploymentBoard />}
      </main>
    </div>
  );
};

export default App;
