import { getUserFromSession } from '@/lib/auth';
import { Role } from '@prisma/client/wasm';
import { response } from '../lib/http/response';
export const ROLE_HIERARCHY = {
  USER: 1,
  ADMIN: 2,
} as const;

type SessionUser = NonNullable<Awaited<ReturnType<typeof getUserFromSession>>>;
type Handler = (req: Request, user: SessionUser) => Promise<Response>;

export function requireRole(handler: Handler, requiredRole?: Role) {
  return async (req: Request) => {
    try {
      const user = await getUserFromSession();

      if (!user) {
        return response.unauthorized('Invalid token');
      }

      if (requiredRole) {
        const userLevel = ROLE_HIERARCHY[user.role as Role];
        const requiredLevel = ROLE_HIERARCHY[requiredRole];

        if (!userLevel || userLevel < requiredLevel) {
          return response.forbidden('You are not allowed to perform this action');
        }
      }

      return handler(req, user);
    } catch {
      return response.internalError('An unexpected error occurred while processing the request');
    }
  };
}
