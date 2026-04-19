import { createConcessionRoutes } from './concessions';
import express from 'express';
import request from 'supertest';
import type { Concession } from '@venuexp/shared';

describe('Concessions Routes', () => {
  let app: express.Express;
  
  const mockConcessions: Concession[] = [
    { id: 'c-1', name: 'Food 1', category: 'food', currentWaitMinutes: 5, capacityPercent: 50, isOpen: true, lastUpdated: '', location: { lat: 0, lng: 0 }, floor: 1, isAccessible: true, tags: [] },
    { id: 'c-2', name: 'Merch 1', category: 'merchandise', currentWaitMinutes: 0, capacityPercent: 0, isOpen: false, lastUpdated: '', location: { lat: 0, lng: 0 }, floor: 1, isAccessible: true, tags: [] }
  ];

  beforeEach(() => {
    app = express();
    app.use('/concessions', createConcessionRoutes(() => mockConcessions));
  });

  it('should return all concessions', async () => {
    const res = await request(app).get('/concessions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('should return a specific concession by ID', async () => {
    const res = await request(app).get('/concessions/c-1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('c-1');
  });

  it('should return 404 for unknown concession', async () => {
    const res = await request(app).get('/concessions/unknown');
    expect(res.status).toBe(404);
  });

  it('should filter by category', async () => {
    const res = await request(app).get('/concessions/category/food');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe('food');
  });

  it('should return empty for unknown category or throw 400 with zod validation', async () => {
    const res = await request(app).get('/concessions/category/unknown');
    expect(res.status).toBe(400); // Because 'unknown' is not in our enum
  });
});
