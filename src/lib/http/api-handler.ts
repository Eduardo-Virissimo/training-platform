import { AppError } from '@/errors/Errors';
import { response } from '@/lib/http/response';
import { getUserFromSession } from '../auth';
import { checkRole } from '@/permissions/requireRole';
import { HandlerOptions } from '@/types/api.types';
import { Role } from '@prisma/client';

export function apiHandler<T>(options: HandlerOptions<T>) {
  return async (req: Request) => {
    try {
      let body = undefined;

      if (options.body) {
        const json = await req.json();
        body = options.body.parse(json);
      }

      let user = undefined;

      if (options.auth) {
        user = await getUserFromSession();

        if (!user) {
          throw new AppError('Unauthorized', 401);
        }
      }

      if (options.role && user) {
        checkRole(user.role, options.role as Role);
      }

      const result = await options.handler({
        req,
        body,
        user,
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        return response.error(error.message);
      }

      console.error(error);

      return response.error('Internal server error');
    }
  };
}
