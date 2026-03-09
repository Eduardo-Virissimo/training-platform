import { AppError } from '@/errors/AppError';
import { response } from '@/lib/http/response';
import { getUserFromSession } from '../auth';
import { checkRole } from '@/permissions/requireRole';
import { HandlerOptions } from '@/types/api.types';
import { ZodError } from 'zod';

export function apiHandler<T = undefined, P = undefined>(options: HandlerOptions<T, P>) {
  return async (req: Request) => {
    try {
      let params = undefined;

      if (options.params) {
        const { searchParams } = new URL(req.url);
        const paramsObj: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
          paramsObj[key] = value;
        }
        params = options.params.parse(paramsObj);
      }

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
        checkRole(user.role, options.role);
      } else if (options.role && !user) {
        throw new AppError('Unauthorized', 401);
      }

      const result = await options.handler({
        req,
        body,
        params,
        user,
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        return response.error(error.message, error.statusCode);
      }

      if (error instanceof ZodError) {
        const issueMessages = error.issues.map(
          (issue) => `${issue.path.join('.')} - ${issue.message}`
        );

        return response.error('Bad Request', 400, issueMessages);
      }

      return response.error('Internal server error', 500);
    }
  };
}
