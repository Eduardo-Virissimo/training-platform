import { getUserFromSession } from '@/lib/auth';
import { Role } from '@prisma/client/wasm';

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
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      }

      if (requiredRole) {
        const userLevel = ROLE_HIERARCHY[user.role as Role];
        const requiredLevel = ROLE_HIERARCHY[requiredRole];

        if (!userLevel || userLevel < requiredLevel) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      return handler(req, user);
    } catch {
      return Response.json({ error: 'Internal error' }, { status: 500 });
    }
  };
}
