import { createRoutingRoutes } from './routing';
import express from 'express';
import request from 'supertest';

describe('Routing Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/routing', createRoutingRoutes());
  });

  it('should return a path with valid payload', async () => {
    const payload = {
      origin: { lat: 10, lng: 20 },
      destination: { lat: 11, lng: 21 },
      isAccessibleMode: true
    };
    const res = await request(app).post('/routing/path').send(payload);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('path');
    expect(res.body.isAccessible).toBe(true);
  });

  it('should reject payload with missing origin/destination', async () => {
    const payload = { destination: { lat: 11, lng: 21 } };
    const res = await request(app).post('/routing/path').send(payload);
    
    expect(res.status).toBe(400);
  });

  it('should reject unknown fields (strict zod check)', async () => {
    const payload = {
      origin: { lat: 10, lng: 20 },
      destination: { lat: 11, lng: 21 },
      extraField: 'should break'
    };
    const res = await request(app).post('/routing/path').send(payload);
    
    expect(res.status).toBe(400);
  });
});
