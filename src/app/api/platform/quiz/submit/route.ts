import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { submitQuizSchema } from '@/schemas/platform.schema';
import { PlatformService } from '@/services/platform.service';

export const POST = apiHandler({
  auth: true,
  body: submitQuizSchema,
  handler: async ({ user, body }) => {
    const result = await PlatformService.submitQuiz(user!, body!.quizId, body!.answers);
    return response.ok(result);
  },
});
