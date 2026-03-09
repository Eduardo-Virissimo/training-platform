import { z } from 'zod';
import { id } from 'zod/v4/locales';

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export const userFiltersSchema = z.object({
  role: z.enum(['ADMIN', 'USER']).optional(),
  id: z.string().optional(),
});

export const userParamsSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
