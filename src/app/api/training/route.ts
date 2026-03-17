import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { canManageTraining } from '@/permissions/training.permission';
import { idParamSchema } from '@/schemas/schemas';
import { createTrainingSchema, trainingFiltersSchema } from '@/schemas/training.schema';
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

export const PUT = apiHandler({
  auth: true,
  role: 'INSTRUCTOR',
  body: createTrainingSchema,
  permissions: canManageTraining,
  params: idParamSchema,
  handler: async ({ req, body, user, params }) => {
    const id = params!.id;
    const data = body as createTraining;

    const training = await TrainingService.updateTraining(id, data);
    return response.ok(training);
  },
});

export const DELETE = apiHandler({
  auth: true,
  role: 'INSTRUCTOR',
  params: idParamSchema,
  permissions: canManageTraining,
  handler: async ({ req, user, params }) => {
    const id = params!.id;
    await TrainingService.deleteTraining(id);
    return response.noContent();
  },
});

export const GET = apiHandler({
  auth: true,
  params: trainingFiltersSchema,
  handler: async ({ req, user, params }) => {
    const id = params!.id;
    const userId = params!.userId;

    const training = await TrainingService.getTrainingByFilters(id, userId, user);
    return response.ok(training);
  },
});
