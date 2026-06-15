import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { canCreateQuiz, canManageQuiz } from '@/permissions/quiz.permission';
import { createQuizSchema, quizFiltersSchema, updateQuizSchema } from '@/schemas/quiz.schema';
import { idParamSchema } from '@/schemas/schemas';
import { QuizService } from '@/services/quiz.service';
import { Role } from '@prisma/client';
import { QuizCreateData, QuizSearchFilters, QuizUpdateData } from '@/types/quiz.types';

export const POST = apiHandler({
  auth: true,
  role: Role.INSTRUCTOR,
  body: createQuizSchema,
  permissions: canCreateQuiz,
  handler: async ({ body }) => {
    const createdQuiz = await QuizService.create(body as QuizCreateData);
    return response.created(createdQuiz);
  },
});

export const GET = apiHandler({
  auth: true,
  params: quizFiltersSchema,
  handler: async ({ params, user }) => {
    const quizzes = await QuizService.search(params as QuizSearchFilters, user!);
    return response.ok(quizzes);
  },
});

export const PUT = apiHandler({
  auth: true,
  role: Role.INSTRUCTOR,
  params: idParamSchema,
  body: updateQuizSchema,
  permissions: canManageQuiz,
  handler: async ({ body, params }) => {
    const updatedQuiz = await QuizService.update(params!.id, body as QuizUpdateData);
    return response.ok(updatedQuiz);
  },
});

export const DELETE = apiHandler({
  auth: true,
  role: Role.INSTRUCTOR,
  params: idParamSchema,
  permissions: canManageQuiz,
  handler: async ({ params }) => {
    await QuizService.delete(params!.id);
    return response.noContent();
  },
});
