import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const keyParamSchema = z.object({
  key: z.string(),
});
