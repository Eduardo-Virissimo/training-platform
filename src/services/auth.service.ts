import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { AppError } from '@/errors/AppError';
import { LoginInput } from '@/schemas/auth.schema';
import { resetBruteForce } from '@/lib/redis/rate-limit';

export async function authenticateUser({ email, password }: LoginInput, identifier: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  await resetBruteForce(identifier);

  const accessToken = await createAccessToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  const refreshToken = await createRefreshToken(user.id);

  return { accessToken, refreshToken };
}
