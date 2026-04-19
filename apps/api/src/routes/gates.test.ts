import { createGateRoutes } from './gates';
import express from 'express';
import request from 'supertest';
import type { Gate } from '@venuexp/shared';

describe('Gates Routes', () => {
  let app: express.Express;
  
  const mockGates: Gate[] = [
    { id: 'gate-1', name: 'G1', status: 'open', currentWaitMinutes: 5, capacityPercent: 50, lastUpdated: '', location: { lat: 0, lng: 0 }, isAccessible: true },
    { id: 'gate-2', name: 'G2', status: 'closed', currentWaitMinutes: 0, capacityPercent: 0, lastUpdated: '', location: { lat: 0, lng: 0 }, isAccessible: false }
  ];

  beforeEach(() => {
    app = express();
    app.use('/gates', createGateRoutes(() => mockGates));
  });

  it('should return all gates', async () => {
    const res = await request(app).get('/gates');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe('gate-1');
  });

  it('should return a specific gate by ID', async () => {
    const res = await request(app).get('/gates/gate-1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('gate-1');
  });

  it('should return 404 for unknown gate', async () => {
    const res = await request(app).get('/gates/unknown');
    expect(res.status).toBe(404);
  });
});
