import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { quizAttemptFiltersSchema } from '@/schemas/quiz.schema';
import { QuizService } from '@/services/quiz.service';
import { QuizAttemptFilters } from '@/types/quiz.types';

export const GET = apiHandler({
  auth: true,
  params: quizAttemptFiltersSchema,
  handler: async ({ params, user }) => {
    const quizId = (params as QuizAttemptFilters).quizId;

    if (!quizId) {
      return response.error('quizId is required', 400);
    }

    const currentAttempt = await QuizService.getCurrentAttempt(quizId, user!);
    return response.ok(currentAttempt);
  },
});
