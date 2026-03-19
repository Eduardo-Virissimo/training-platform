import { z } from 'zod';
z.config(z.locales.pt());

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty('Email é obrigatório.')
    .email('Formato de email inválido.')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .nonempty('Senha é obrigatório.')
    .min(6, 'Senha deve ter pelo menos 6 caracteres.')
    .max(100, 'Senha deve ter no máximo 100 caracteres.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .nonempty('Nome é obrigatório.')
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(100, 'Nome deve ter no máximo 100 caracteres.'),
  email: z
    .string()
    .nonempty('Email é obrigatório.')
    .email('Formato de email inválido.')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .nonempty('Senha é obrigatória.')
    .min(6, 'Senha deve ter pelo menos 6 caracteres.')
    .max(100, 'Senha deve ter no máximo 100 caracteres.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
