import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { completeLessonSchema } from '@/schemas/platform.schema';
import { PlatformService } from '@/services/platform.service';

export const POST = apiHandler({
  auth: true,
  body: completeLessonSchema,
  handler: async ({ user, body }) => {
    const result = await PlatformService.completeLesson(user!, body!.lessonId);
    return response.ok(result);
  },
});
