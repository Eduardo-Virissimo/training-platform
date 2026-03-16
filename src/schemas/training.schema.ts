import { z } from 'zod';

export const createTrainingSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  content: z.string().optional(),
  trackId: z.string().uuid().optional(),
});

export const updateTrainingSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  trackId: z.string().uuid().optional(),
});

export const trainingFiltersSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  userId: z.string().uuid().optional(),
});
