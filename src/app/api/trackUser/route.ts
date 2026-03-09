import { apiHandler } from '@/lib/http/api-handler';

import { response } from '@/lib/http/response';
import { canManageTrack } from '@/permissions/track.permissions';
import { idParamSchema } from '@/schemas/schemas';
import { TrackUserService } from '@/services/trackUser.service';
import { trackUserCreateSchema } from '@/schemas/trackUser.schemas';
export const POST = apiHandler({
  auth: true,
  body: trackUserCreateSchema,
  params: idParamSchema,
  permissions: canManageTrack,
  handler: async ({ req, body, params }) => {
    const trackUser = await TrackUserService.addUserToTrack(params!.id, body!.email);

    return response.ok(trackUser);
  },
});
