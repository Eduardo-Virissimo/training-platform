import { z } from 'zod';

const quizOptionSchema = z.object({
  content: z.string().min(1),
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z.object({
  content: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE']),
  options: z.array(quizOptionSchema).min(2),
});

export const createQuizSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  moduleId: z.string().uuid(),
  position: z.number().int().min(0).optional(),
  questions: z.array(quizQuestionSchema).optional(),
});

export const updateQuizSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  moduleId: z.string().uuid().optional(),
  position: z.number().int().min(0).optional(),
  questions: z.array(quizQuestionSchema).min(1).optional(),
});

export const quizFiltersSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  moduleId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export const submitQuizAttemptSchema = z
  .object({
    optionId: z.string().uuid().optional(),
    optionIds: z.array(z.string().uuid()).min(1).optional(),
  })
  .refine((value) => !!value.optionId || (value.optionIds?.length ?? 0) > 0, {
    message: 'optionId or optionIds is required',
    path: ['optionIds'],
  });

export const quizAttemptFiltersSchema = z.object({
  quizId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});
