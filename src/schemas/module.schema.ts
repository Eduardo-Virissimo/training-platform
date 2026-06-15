import { z } from 'zod';

export const createModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  trackId: z.string().uuid(),
  position: z.number().int().min(0).optional(),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const moduleFiltersSchema = z.object({
  id: z.string().uuid().optional(),
  trackId: z.string().uuid().optional(),
  title: z.string().optional(),
});
