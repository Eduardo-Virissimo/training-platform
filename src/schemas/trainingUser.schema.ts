import { z } from 'zod';

export const createTrainingUserSchema = z.object({
  email: z.string().email(),
});
