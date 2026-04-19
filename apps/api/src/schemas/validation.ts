import { z } from 'zod';

export const LatLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const RoutingRequestSchema = z.object({
  origin: LatLngSchema,
  destination: LatLngSchema,
  isAccessibleMode: z.boolean().optional().default(false),
}).strict(); // Reject unknown fields for security

export const IdParamSchema = z.object({
  id: z.string().min(1),
}).strict();

export const CatParamSchema = z.object({
  cat: z.enum(['food', 'beverage', 'merchandise', 'restroom']),
}).strict();
