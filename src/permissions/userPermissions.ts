import { getUserFromSession } from '@/lib/auth';
import { User } from '@prisma/client';

type Handler = (req: Request, user: User) => Promise<Response>;

export function canUpdateUser(handler: Handler) {
  return async (req: Request) => {
    try {
      const user = await getUserFromSession();
      if (!user) {
        return Response.json({ error: 'Invalid token' }, { status: 401 });
      }
      const { searchParams } = new URL(req.url);

      const id = searchParams.get('id');

      if (!id) {
        return Response.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
      }
      if (user.role === 'ADMIN' || user.id === id) {
        return handler(req, user);
      } else {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return Response.json({ error: 'Internal error' }, { status: 500 });
    }
  };
}
