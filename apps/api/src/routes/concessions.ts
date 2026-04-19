/**
 * REST routes for concession wait-times.
 */
import { Router } from 'express';
import type { Concession } from '@venuexp/shared';
import { IdParamSchema, CatParamSchema } from '../schemas/validation';
export function createConcessionRoutes(getConcessions: () => Concession[]): Router {
  const router = Router();

  /** GET /api/concessions — all concessions with current wait-times */
  router.get('/', (_req, res) => {
    res.json(getConcessions());
  });

  /** GET /api/concessions/:id — single concession */
  router.get('/:id', (req, res) => {
    const paramValidation = IdParamSchema.safeParse({ id: req.params.id });
    if (!paramValidation.success) {
      res.status(400).json({ error: 'Invalid ID parameter', details: paramValidation.error.flatten() });
      return;
    }
    
    const concession = getConcessions().find((c) => c.id === paramValidation.data.id);
    if (!concession) {
      res.status(404).json({ error: 'Concession not found' });
      return;
    }
    res.json(concession);
  });

  /** GET /api/concessions?category=food — filter by category */
  router.get('/category/:cat', (req, res) => {
    const paramValidation = CatParamSchema.safeParse({ cat: req.params.cat });
    if (!paramValidation.success) {
      res.status(400).json({ error: 'Invalid category parameter', details: paramValidation.error.flatten() });
      return;
    }
    
    const filtered = getConcessions().filter((c) => c.category === paramValidation.data.cat);
    res.json(filtered);
  });

  return router;
}
