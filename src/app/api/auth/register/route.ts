import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { response } from '@/lib/http/response';
import { registerSchema } from '@/schemas/auth.schema';
import { apiHandler } from '@/lib/http/api-handler';
import { AppError } from '@/errors/AppError';
import { RateLimitError } from '@/errors/RateLimitError';
import { getClientIp } from '@/lib/request-meta';
import { checkRegisterRateLimit } from '@/lib/redis/rate-limit';

export const POST = apiHandler({
  body: registerSchema,
  handler: async ({ body, req }) => {
    const ip = getClientIp(req);
    const { allowed, retryAfter } = await checkRegisterRateLimit(ip);

    if (!allowed) {
      throw new RateLimitError(
        'Too many registration attempts from this IP. Please try again later.',
        retryAfter
      );
    }

    const { name, email, password } = body!;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return response.created(user);
  },
});
