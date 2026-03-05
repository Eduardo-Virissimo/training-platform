import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
