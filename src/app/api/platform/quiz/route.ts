import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { quizFiltersSchema } from '@/schemas/platform.schema';
import { PlatformService } from '@/services/platform.service';

export const GET = apiHandler({
  auth: true,
  params: quizFiltersSchema,
  handler: async ({ user, params }) => {
    if (!params?.id) {
      return response.error('id is required', 400);
    }

    const quiz = await PlatformService.getQuiz(user!, params.id);
    return response.ok(quiz);
  },
});
