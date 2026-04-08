import { z } from 'zod';

export const completeLessonSchema = z.object({
  lessonId: z.string().uuid(),
});

export const quizFiltersSchema = z.object({
  id: z.string().uuid().optional(),
});

export const submitQuizSchema = z.object({
  quizId: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        optionId: z.string().uuid(),
      })
    )
    .min(1),
});
