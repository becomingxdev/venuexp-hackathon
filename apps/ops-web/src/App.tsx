import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { CrowdHeatmap } from './components/CrowdHeatmap';
import { StaffDeploymentBoard } from './components/StaffDeploymentBoard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'staff'>('heatmap');

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.title}>VenueXP — Operations Dashboard</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Event: IPL 2026 Finals</div>
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
