import { z } from 'zod';
import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { canViewTrack } from '@/permissions/track.permissions';
import { getRanking } from '@/services/trackRanking.service';

const rankingParamsSchema = z.object({
  trackId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export const GET = apiHandler({
  auth: true,
  params: rankingParamsSchema,
  permissions: canViewTrack,
  handler: async ({ params, user }) => {
    if (!params || !user) {
      return response.error('Parâmetros inválidos', 400);
    }

    const result = await getRanking(params.trackId, user.id, params.limit);

    return response.ok(result);
  },
});
