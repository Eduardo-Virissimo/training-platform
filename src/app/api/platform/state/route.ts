import { apiHandler } from '@/lib/http/api-handler';
import { response } from '@/lib/http/response';
import { PlatformService } from '@/services/platform.service';

export const GET = apiHandler({
  auth: true,
  handler: async ({ user }) => {
    const state = await PlatformService.getState(user!);
    return response.ok(state);
  },
});
