import { z } from 'zod';

export const trackUserCreateSchema = z.object({
  email: z.string().email(),
});
