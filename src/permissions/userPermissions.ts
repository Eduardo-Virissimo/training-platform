import { getUserFromSession } from '@/lib/auth';
import { Role, User } from '@prisma/client';
import { response } from '../lib/http/response';
import { UserHandler } from '@/types/api.types';

type Handler = (req: Request, user: UserHandler) => Promise<Response>;

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
        return response.error('ID do usuário é obrigatório');
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
