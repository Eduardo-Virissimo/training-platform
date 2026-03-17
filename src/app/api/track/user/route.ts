import { apiHandler } from '@/lib/http/api-handler';

import { response } from '@/lib/http/response';
import { canManageTrack } from '@/permissions/track.permissions';
import { idParamSchema } from '@/schemas/schemas';
import { TrackUserService } from '@/services/trackUser.service';
import { trackUserCreateSchema } from '@/schemas/trackUser.schemas';
import { Role } from '@prisma/client';

export const POST = apiHandler({
  auth: true,
  body: trackUserCreateSchema,
  params: idParamSchema,
  role: Role.INSTRUCTOR,
  permissions: canManageTrack,
  handler: async ({ req, body, params }) => {
    const trackUser = await TrackUserService.addUserToTrack(params!.id, body!.email);

    return response.ok(trackUser);
  },
});

export const DELETE = apiHandler({
  auth: true,
  params: idParamSchema,
  permissions: canManageTrack,
  role: Role.INSTRUCTOR,
  handler: async ({ req, params }) => {
    await TrackUserService.removeUserFromTrack(params!.id);
    return response.noContent();
  },
});
