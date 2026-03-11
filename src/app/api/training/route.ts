import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { createTrainingSchema } from '@/schemas/training.schema';
import { TrainingService } from '@/services/training.service';
import { createTraining } from '@/types/training.types';

export const POST = apiHandler({
  auth: true,
  role: 'INSTRUCTOR',
  body: createTrainingSchema,
  handler: async ({ req, body, user }) => {
    const data = body as createTraining;
    data.userId = user!.id;

    const training = await TrainingService.createTraining(data);
    return response.created(training);
  },
});
