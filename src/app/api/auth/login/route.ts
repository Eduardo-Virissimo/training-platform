import { apiHandler } from '@/lib/http/api-handler';
import { loginSchema } from '@/schemas/auth.schema';
import { response } from '@/lib/http/response';
import { authenticateUser } from '@/services/auth.service';
import { AUTH_CONFIG } from '@/lib/auth';
import { checkLoginRateLimit } from '@/lib/redis/rate-limit';
import { RateLimitError } from '@/errors/RateLimitError';
import { generateFingerprint } from '@/lib/fingerprint';
import { getClientIp, getUserAgent } from '@/lib/request-meta';

export const POST = apiHandler({
  body: loginSchema,
  handler: async ({ body, req }) => {
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);
    const fingerprint = generateFingerprint(ip, userAgent);

    const { allowed, retryAfter } = await checkLoginRateLimit(body!.email, ip);

    if (!allowed) {
      throw new RateLimitError('Too many login attempts. Please try again later.', retryAfter);
    }

    const { accessToken, refreshToken } = await authenticateUser(body!, ip, fingerprint);

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
