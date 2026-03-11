import { apiHandler } from '@/lib/http/api-handler';
import { loginSchema } from '@/schemas/auth.schema';
import { response } from '@/lib/http/response';
import { authenticateUser } from '@/services/auth.service';
import { AUTH_CONFIG } from '@/lib/auth';
import { checkBruteForce } from '@/lib/redis/rate-limit';
import { RateLimitError } from '@/errors/RateLimitError';
import { generateFingerprint } from '@/lib/fingerprint';

export const POST = apiHandler({
  body: loginSchema,
  handler: async ({ body, req }) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const identifier = `${ip}:${body!.email}`;
    const fingerprint = generateFingerprint(ip, userAgent);

    const { allowed, retryAfter } = await checkBruteForce(identifier);

    if (!allowed) {
      throw new RateLimitError('Too many login attempts. Please try again later.', retryAfter);
    }

    const { accessToken, refreshToken } = await authenticateUser(body!, identifier, fingerprint);

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
