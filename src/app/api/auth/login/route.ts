import { apiHandler } from '@/lib/http/api-handler';
import { loginSchema } from '@/schemas/auth.schema';
import { response } from '@/lib/http/response';
import { authenticateUser } from '@/services/auth.service';
import { AUTH_CONFIG } from '@/lib/auth';

export const POST = apiHandler({
  body: loginSchema,
  handler: async ({ body }) => {
    const { accessToken, refreshToken } = await authenticateUser(body!);

    const res = response.ok({
      message: 'Login successful',
    });

    res.cookies.set('accessToken', accessToken, {
      ...AUTH_CONFIG.cookieOptions,
      maxAge: AUTH_CONFIG.accessTokenExpiresIn,
    });

    res.cookies.set('refreshToken', refreshToken, {
      ...AUTH_CONFIG.cookieOptions,
      maxAge: AUTH_CONFIG.refreshTokenExpiresIn,
    });

    return res;
  },
});
