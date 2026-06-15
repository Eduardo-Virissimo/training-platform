import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { canManageTraining, canViewTraining } from '@/permissions/training.permission';
import { idParamSchema } from '@/schemas/schemas';
import { createTrainingSchema } from '@/schemas/training.schema';
import { createTrainingUserSchema } from '@/schemas/trainingUser.schema';
import { TrainingUserService } from '@/services/trainingUserService';

export const POST = apiHandler({
  auth: true,
  body: createTrainingUserSchema,
  params: idParamSchema,
  permissions: canViewTraining,
  handler: async ({ req, body, user, params }) =>
    response.ok(await TrainingUserService.addUserToTraining(params!.id, body!.email)),
});

export const DELETE = apiHandler({
  auth: true,
  params: idParamSchema,
  permissions: canViewTraining,
  body: createTrainingUserSchema,
  handler: async ({ req, params, body }) => {
    await TrainingUserService.removeUserFromTraining(params!.id);
    return response.noContent();
  },
});
