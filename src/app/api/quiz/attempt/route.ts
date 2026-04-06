import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { QuizService } from '@/services/quiz.service';
import { quizAttemptFiltersSchema, submitQuizAttemptSchema } from '@/schemas/quiz.schema';
import { QuizAttemptFilters, QuizAttemptSubmitData } from '@/types/quiz.types';

export const POST = apiHandler({
  auth: true,
  body: submitQuizAttemptSchema,
  handler: async ({ body, user }) => {
    const attempt = await QuizService.submitAttempt(body as QuizAttemptSubmitData, user!);
    return response.created(attempt);
  },
});

export const GET = apiHandler({
  auth: true,
  params: quizAttemptFiltersSchema,
  handler: async ({ params, user }) => {
    const attempts = await QuizService.listAttempts(params as QuizAttemptFilters, user!);
    return response.ok(attempts);
  },
});
