import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { canManageTrack } from '@/permissions/track.permissions';
import { idParamSchema } from '@/schemas/schemas';
import { createTrackSchema, trackFiltersSchema } from '@/schemas/track.schemas';
import { TrackService } from '@/services/track.service.';
import { TrackCreateData, TrackSearchFilters } from '@/types/api.types';
import { Role } from '@prisma/client';

export const POST = apiHandler({
  auth: true,
  body: createTrackSchema,
  role: Role.INSTRUCTOR,
  handler: async ({ req, body, user }) => {
    const data = body as TrackCreateData;
    data.userId = user!.id;

    const track = await TrackService.create(data);

    return response.created(track);
  },
});

export const GET = apiHandler({
  auth: true,
  params: trackFiltersSchema,
  handler: async ({ req, params, user }) => {
    const tracks = await TrackService.search(params as TrackSearchFilters, user!);

    return response.ok(tracks);
  },
});

export const PUT = apiHandler({
  auth: true,
  params: idParamSchema,
  body: createTrackSchema,
  role: Role.INSTRUCTOR,
  permissions: canManageTrack,
  handler: async ({ req, body, params }) => {
    const data = body as TrackCreateData;
    const id = params?.id || '';
    const track = await TrackService.update(id, data);

    return response.created(track);
  },
});

export const DELETE = apiHandler({
  auth: true,
  params: idParamSchema,
  role: Role.INSTRUCTOR,
  permissions: canManageTrack,
  handler: async ({ req, params }) => {
    const id = params?.id || '';
    await TrackService.delete(id);
    return response.noContent();
  },
});
