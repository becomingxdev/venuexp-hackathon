/**
 * REST routes for gate wait-times — supplements the WebSocket stream
 * for clients that want a one-shot fetch (e.g. initial load).
 */
import { Router } from 'express';
import type { Gate } from '@venuexp/shared';
import { IdParamSchema } from '../schemas/validation';

export function createGateRoutes(getGates: () => Gate[]): Router {
  const router = Router();

  /** GET /api/gates — current snapshot of all gate wait-times */
  router.get('/', (_req, res) => {
    res.json(getGates());
  });

  /** GET /api/gates/:id — single gate */
  router.get('/:id', (req, res) => {
    const paramValidation = IdParamSchema.safeParse({ id: req.params.id });
    if (!paramValidation.success) {
      res.status(400).json({ error: 'Invalid ID parameter', details: paramValidation.error.flatten() });
      return;
    }

    const gate = getGates().find((g) => g.id === paramValidation.data.id);
    if (!gate) {
      res.status(404).json({ error: 'Gate not found' });
      return;
    }
    res.json(gate);
  });

  return router;
}
