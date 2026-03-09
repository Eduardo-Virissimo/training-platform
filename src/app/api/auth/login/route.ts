import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { apiHandler } from '@/lib/http/api-handler';
import { loginSchema } from '@/schemas/auth.schema';
import { AppError } from '@/errors/AppError';
import { response } from '@/lib/http/response';
import { authenticateUser } from '@/services/auth.service';

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const POST = apiHandler({
  body: loginSchema,
  handler: async ({ body }) => {
    const { accessToken, refreshToken } = await authenticateUser(body!);

    const res = response.ok({
      message: 'Login successful',
    });

    res.cookies.set('accessToken', accessToken, {
      ...BASE_COOKIE_OPTIONS,
      maxAge: 60 * 15,
    });

    res.cookies.set('refreshToken', refreshToken, {
      ...BASE_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 15,
    });

    return res;
  },
});
