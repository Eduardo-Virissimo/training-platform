import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { AppError } from '@/errors/AppError';
import { LoginInput } from '@/schemas/auth.schema';

export async function authenticateUser({ email, password }: LoginInput) {
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

  return { accessToken, refreshToken };
}
