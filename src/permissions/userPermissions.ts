import { getUserFromSession } from '@/lib/auth';
import { User } from '@prisma/client';
import { response } from '../lib/http/response';

type Handler = (req: Request, user: User) => Promise<Response>;

export function canUpdateUser(handler: Handler) {
  return async (req: Request) => {
    try {
      const user = await getUserFromSession();
      if (!user) {
        return response.unauthorized('Invalid token');
      }
      const { searchParams } = new URL(req.url);

      const id = searchParams.get('id');

      if (!id) {
        return response.error('ID do usuário é obrigatório', 400);
      }
      if (user.role === 'ADMIN' || user.id === id) {
        return handler(req, user);
      } else {
        return response.forbidden('You are not allowed to update this user');
      }
    } catch {
      return response.internalError('An unexpected error occurred while processing the request');
    }
  };
}
