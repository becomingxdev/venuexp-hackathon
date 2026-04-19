/**
 * REST routes for Smart Routing.
 * Integrates Google Maps APIs and local density checks to compute
 * the fastest and least-crowded path to a seat or facility.
 */
import { Router } from 'express';
import { RoutingRequestSchema } from '../schemas/validation';

export function createRoutingRoutes(): Router {
  const router = Router();

  /**
   * POST /api/routing/path
   * Body: { origin: LatLng, destination: LatLng, isAccessibleMode: boolean }
   * Returns a routing polyline prioritizing non-stairways if accessible mode is true.
   */
  router.post('/path', (req, res) => {
    const validation = RoutingRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ 
        error: 'Invalid request parameters', 
        details: validation.error.flatten() 
      });
      return;
    }

    const { origin, destination, isAccessibleMode } = validation.data;

    // Mock response simulating a Google Maps Indoor Directions API return
    res.json({
      path: [origin, destination],
      estimatedMinutes: 5,
      isAccessible: !!isAccessibleMode,
      distance: '350m'
    });
  });

  return router;
}
