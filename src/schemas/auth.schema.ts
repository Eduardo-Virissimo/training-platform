import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty('Email is required.')
    .email('Invalid email format.')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .nonempty('Password is required.')
    .min(6, 'Password must be at least 6 characters long.')
    .max(100, 'Password must be at most 100 characters long.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty('Name is required.')
      .min(2, 'Name must be at least 2 characters long.')
      .max(100, 'Name must be at most 100 characters long.'),
    email: z
      .string()
      .nonempty('Email is required.')
      .email('Invalid email format.')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .nonempty('Password is required.')
      .min(6, 'Password must be at least 6 characters long.')
      .max(100, 'Password must be at most 100 characters long.'),
    confirmPassword: z.string().nonempty('Confirm Password is required.'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      return ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
