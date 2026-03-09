import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { apiHandler } from '@/lib/http/api-handler';
import { loginSchema } from '@/schemas/auth.schema';
import { AppError } from '@/errors/AppError';
import { response } from '@/lib/http/response';

export const POST = apiHandler({
  body: loginSchema,
  handler: async ({ body }) => {
    const { email, password } = body!;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = await createAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshToken = await createRefreshToken(user.id);

    const res = response.ok({
      message: 'Login successful',
    });

    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  },
});
