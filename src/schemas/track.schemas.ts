import { z } from 'zod';
import { id } from 'zod/v4/locales';

export const createTrackSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const trackFiltersSchema = z.object({
  title: z.string().optional(),
  id: z.string().optional(),
});
